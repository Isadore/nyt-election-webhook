import urllib from "urllib";
import moment from "moment-timezone";
import { NYT_API } from "./interfaces";

require('dotenv').config();

let lastPoll: NYT_API.StateData[], lastEtag: string, checks = 0;

async function pollEndpoint() {

    let req: urllib.HttpClientResponse<NYT_API.CountyModel>;

    try {

        req = await urllib.request('https://static01.nyt.com/elections-assets/2020/data/liveModel/2020-11-03/president/county-model.json', {
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36 Edg/88.0.685.3',
                'cache-control': 'no-cache',
                pragma: 'no-cache',
                origin: 'https://www.nytimes.com',
                referer: 'https://www.nytimes.com/',
                'if-none-match': lastEtag
            },
            dataType: "json",
            timeout: 5000
        });

    } catch(ex) {

        return log(`Failed getting data ${ex}`);

    };

    // log(req.status, req.res.headers.etag);

    if(req.status == 304 && lastEtag && lastPoll) return;

    if(req.status != 200)
        return log(`Unexpected response getting data: ${req.status}`);
    
    lastEtag = String(req.res.headers.etag);
     
    if(req.data.races && req.data.race_type == 'president') {

        let totalVotes = req.data.races.reduce((a, b) => a + b.votes, 0);

        if(checks > 0) {

            let voteChange = totalVotes - lastPoll.reduce((a, b) => a + b.votes, 0);

            if(voteChange)
                log(`Total Votes: ${totalVotes.toLocaleString()} - Change: ${(voteChange > 0 ? '+' : '') + voteChange.toLocaleString()}`);

            const StateFilter = String(process.env.STATE_FILTER) && String(process.env.STATE_FILTER).split(',').map(s => s.trim().toUpperCase())

            lastPoll.forEach((s, i) => {

                let c = req.data.races.find(c => c.state_id == s.state_id);

                if((Date.parse(s.last_updated) < Date.parse(c.last_updated)) || (JSON.stringify(s) != JSON.stringify(c))) {

                    if(s.leader_margin_value != c.leader_margin_value) {

                        if(!StateFilter || StateFilter.includes(s.state_id.toUpperCase()))
                            sendWebhook(c, s, true);

                    };

                    sendWebhook(c, s);

                    lastPoll[i] = c;

                };

            });

            // Test Hook
            // sendWebhook(req.data.races[0], lastPoll[0]);

        } else {

            log(`New York Times Monitor Started - Total Votes: ${totalVotes.toLocaleString()}`);

            lastPoll = req.data.races;

        };

    } else {

        log(req.data);

        return log('Error getting data: Malformed response');

    };

    checks++;
};

async function sendWebhook(now: NYT_API.StateData, then: NYT_API.StateData, filtered?: boolean, time = moment()) {

    let req: urllib.HttpClientResponse<any>;

    let url = filtered ? process.env.WEBHOOK_URL_FILTERED : process.env.WEBHOOK_URL;

    if(!url) return;

    let partyVoteText = ['democrat', 'republican', 'other'].map(p => {
        let [t, n] = [then, now].map(time => time.geo.reduce((a, b) => Number(b.vote_counted[p]) + a, 0));
        return `\n${{democrat: 'Biden', other: 'Other'}[p] || 'Trump'}: ${t.toLocaleString()} (${(t/then.votes * 100).toFixed()}%) => ${n.toLocaleString()} (${(n/now.votes * 100).toFixed()}%) ${(n >= t ? '+' : '') + (n - t).toLocaleString()}`
    }).join('');

    try {

        req = await urllib.request(url, {
            method: 'POST',
            dataType: "json",
            contentType: "json",
            data: {
                username: 'Election Updates',
                embeds: [{
                    title: `${now.state_name} (${now.state_id}) Election Update`,
                    color: (((now.leader_party_id == then.leader_party_id) && (((now.leader_party_id == 'republican') && (now.leader_margin_value > then.leader_margin_value)) || ((now.leader_party_id == 'democrat') && (now.leader_margin_value < then.leader_margin_value)))) || (then.leader_party_id == 'democrat' && now.leader_party_id == 'republican')) ? 0xfc0303 : ((now.leader_margin_value == then.leader_margin_value) && (parseInt(String(then.votes * then.leader_margin_value * .01)) == parseInt(String(now.votes * now.leader_margin_value * .01)))) ? null : 0x0314fc,
                    description: `**Leading Candidate:** ${then.leader_party_id == 'republican' ? 'Donald J. Trump' : 'Joseph R. Biden Jr.'}${(now.leader_party_id != then.leader_party_id) ? ' => ' + (now.leader_party_id == 'republican' ? 'Donald J. Trump' : 'Joseph R. Biden Jr.') : ''}\n\n` + 
                    `**Margin:**\n+${then.leader_margin_value}% => +${now.leader_margin_value}% (${((now.leader_margin_value >= then.leader_margin_value) ? '+' : '') + parseFloat((now.leader_margin_value - then.leader_margin_value).toFixed(4))}%)\n+${parseInt(String(then.votes * then.leader_margin_value * .01)).toLocaleString()} votes => +${parseInt(String(now.votes * now.leader_margin_value * .01)).toLocaleString()} (${(parseInt(String(now.votes * now.leader_margin_value * .01)) >= parseInt(String(then.votes * then.leader_margin_value * .01)) ? '+' : '') + (parseInt(String(now.votes * now.leader_margin_value * .01)) - parseInt(String(then.votes * then.leader_margin_value * .01))).toLocaleString()})\n\n` +
                    `**Reported Votes:**\n${then.votes.toLocaleString()} (${then.eevp_value}) => ${now.votes.toLocaleString()} (${now.eevp_value}) ${(now.votes >= then.votes) ? '+' : ''}${(now.votes - then.votes).toLocaleString()}${partyVoteText}\n\n` +
                    `**Est Remaining Votes:**\n${(then.tot_exp_vote - then.votes).toLocaleString()} => ${(now.tot_exp_vote - now.votes).toLocaleString()} (${((now.tot_exp_vote - now.votes) >= (then.tot_exp_vote - then.votes)) ? '+' : ''}${(now.tot_exp_vote - now.votes) - (then.tot_exp_vote - then.votes)})`,
                    footer: {
                        text: time.tz('America/New_York').format('MM/DD/YYYY - hh:mm:ss A'),
                    }
                }]
            }
        });

    } catch(ex) {

        return log(`Failed sending webhook: ${ex}`);

    };

    if (req.status == 429)
        return setTimeout(() => sendWebhook(now, then, filtered, time), Number(req.headers['retry-after']));
    if (req.status != 204)
        return log(`Unexpected response sending webhook: ${req.status} ${JSON.stringify(req.data)}`);

};

function log(...str: any[]) {
    let time = moment().tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A');
    return console.log(`[${time}]`, ...str);
};

setInterval(pollEndpoint, 10000);
pollEndpoint();