import urllib from "urllib";
import moment from "moment-timezone";

require('dotenv').config();

interface StateData {
    race_id: string, // AK-G-P-2020-11-03
    race_slug: string, // ak-president-general-2020-11-03
    url: string, // https://www.nytimes.com/interactive/2020/11/03/us/elections/results-alaska-president.html
    state_page_url: string, // https://www.nytimes.com/interactive/2020/11/03/us/elections/results-alaska.html
    ap_polls_page: string, // https://www.nytimes.com/interactive/2020/11/03/us/elections/ap-polls-alaska.html
    race_type: string, // president
    election_type: string, // general
    election_date: string, // 2020-11-03
    runoff: boolean, // false
    race_name: string, // President
    office: string, // President
    officeid: string, // P
    race_rating: string, // likely-rep
    seat: string, //
    seat_name: string, //
    state_id: string, // AK
    state_slug: string, // alaska
    state_name: string, // Alaska
    state_nyt_abbrev: string, // Alaska
    state_shape: string, // horizontal
    state_aspect_ratio: number, // 1
    party_id: string, //
    uncontested: boolean, // false
    report: boolean, // true
    result: string, //
    gain: boolean, // false
    lost_seat: string, // 
    electoral_votes: number, // 3
    absentee_votes: number, // 33200
    absentee_counties: number, // 34
    absentee_count_progress: string, // unknown
    poll_display: string, // Polls close at 1 a.m. Eastern time.
    poll_countdown_display: string, // Polls close in
    poll_waiting_display: string, // Polls have closed.
    poll_time: string, // 2020-11-04T06:00:00.000Z
    poll_time_short: string, // 1 a.m.
    precincts_reporting: number, // 360
    precincts_total: number, // 441
    reporting_display: string, // 82% reporting
    reporting_value: string, // 82%
    eevp: number, // 56
    tot_exp_vote: number, // 367000
    eevp_source: string, // edison
    eevp_value: string, // 56%
    eevp_display: string, // 56% reported
    county_data_source: string, // edison
    incumbent_party: string, //
    no_forecast: boolean, // false
    last_updated: string, //  2020-11-04T18:34:58Z
    has_incumbent: boolean, // true
    leader_margin_value: number, // 29.8679
    leader_margin_display: string, // R+30
    leader_margin_name_display: string, // Trump +30
    leader_party_id: string, // republican
    votes2016: number, // 318608
    margin2016: number, // 14.7
    clinton2016: number, // 116454
    trump2016: number, // 163387
    votes2012: number, // 300495
    margin2012: number, // 13.99
    expectations_text: string, // The only results reported on election night were from in-person early voting through Oct. 29 and from the precincts on Election Day. No mail or other absentee ballots will be counted until about a week after the election.
    expectations_text_short: string, // The only results reported on election night were from in-person early voting through Oct. 29 and from the precincts on Election Day. No mail or other absentee ballots will be counted until about a week after the election.
    absentee_ballot_deadline: number, // 10
    absentee_postmark_deadline: number, // 0
    timestamp_api: string, // 2020-11-05T06:16:53.003Z
    geo_type: string, // counties
    geo_type_mapped: string, // counties
    runoff_eligible: boolean, // false
    votetype: string, // 
    votes: number, // 172031
    geo: CountyData[]
};

interface CountyData {
    fips: string, // 01001
    name?: string,
    votes?: number,
    absentee_votes?: number,
    reporting?: number,
    precincts?: number,
    absentee_method?: string,
    eevp?: number,
    tot_exp_vote?: number,
    eevp_value?: string, // >98%
    eevp_display?: string, // >98% reported
    eevp_source?: string, // edison
    turnout_stage?: number, // 2
    absentee_count_progress?: string, // unknown
    absentee_max_ballots?: number,
    last_updated?: string, // 2020-11-04T10:43:23Z
    leader_margin_value?: number, // 44.553
    leader_margin_display?: string, // R+45
    leader_margin_name_display?: string, // Trump +45
    leader_party_id?: string, // republican
    margin2020?: number, // 44.553
    votes2016?: number, // 24973
    margin2016?: number, // 49
    votes2012?: number, // 23973
    margin2012?: number, // 45.95
    vote_counted: {
        democrat: number,
        other: number,
        republican: number
    },
    vote_remaining: {
        democrat: number,
        other: number,
        republican: number
    }
};

interface CountyModel {
    checksum: string;
    race_id: "county-model";
    race_type: "president";
    races: StateData[];
};

let lastPoll: StateData[];

let lastEtag: string;

let checks = 0;

async function pollEndpoint() {

    let req: urllib.HttpClientResponse<CountyModel>;

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

                if(Date.parse(s.last_updated) < Date.parse(c.last_updated))
                    lastPoll[i] = c;
                else return;
    
                if(((s.votes != c.votes) || (s.leader_margin_value != c.leader_margin_value)) && (!StateFilter || StateFilter.includes(s.state_id.toUpperCase())))
                    return sendWebhook(c, s);

            });

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

async function sendWebhook(now: StateData, then: StateData, time = moment()) {

    let req: urllib.HttpClientResponse<any>;

    let partyVoteText = ['democrat', 'republican', 'other'].map(p => {
        let t = then.geo.reduce((a, b) => b.vote_counted[p] + a, 0);
        let n = now.geo.reduce((a, b) => b.vote_counted[p] + a, 0);
        return `\n${p == 'democrat' ? 'Biden' : p == 'other' ? 'Other' : 'Trump'}: ${t.toLocaleString()} (${(t/then.votes * 100).toFixed()}%) => ${n.toLocaleString()} (${(n/now.votes * 100).toFixed()}%) ${(n >= t ? '+' : '') + (n - t).toLocaleString()}`
    }).join('');

    try {

        req = await urllib.request(process.env.WEBHOOK_URL, {
            method: 'POST',
            dataType: "json",
            contentType: "json",
            data: {
                username: 'Election Updates',
                embeds: [{
                    title: `${now.state_name} (${now.state_id}) Election Update`,
                    color: (((now.leader_party_id == 'republican') && (now.leader_margin_value > then.leader_margin_value)) || ((now.leader_party_id == 'democrat') && (now.leader_margin_value < then.leader_margin_value))) ? 0xfc0303 : ((now.leader_margin_value == then.leader_margin_value) && (parseInt(String(then.votes * then.leader_margin_value * .01)) ==  parseInt(String(now.votes * now.leader_margin_value * .01)))) ? null : 0x0314fc,
                    description: `**Leading Candidate:** ${now.leader_party_id == 'republican' ? 'Donald J. Trump' : 'Joseph R. Biden Jr.'}\n\n` + 
                    `**Margin:**\n+${then.leader_margin_value}% => +${now.leader_margin_value}% (${((now.leader_margin_value >= then.leader_margin_value) ? '+' : '') + parseFloat((now.leader_margin_value - then.leader_margin_value).toFixed(4))}%)\n+${parseInt(String(then.votes * then.leader_margin_value * .01)).toLocaleString()} votes => +${parseInt(String(now.votes * now.leader_margin_value * .01)).toLocaleString()} (${(parseInt(String(now.votes * now.leader_margin_value * .01)) >= parseInt(String(then.votes * then.leader_margin_value * .01)) ? '+' : '') + (parseInt(String(now.votes * now.leader_margin_value * .01)) - parseInt(String(then.votes * then.leader_margin_value * .01))).toLocaleString()})\n\n` +
                    `**Reported Votes:**\n${then.votes.toLocaleString()} (${then.eevp_value}) => ${now.votes.toLocaleString()} (${now.eevp_value}) ${(now.votes >= then.votes) ? '+' : ''}${(now.votes - then.votes).toLocaleString()}${partyVoteText}\n\n` +
                    `**Estimated Remaining Votes:** ${(now.tot_exp_vote - now.votes).toLocaleString()}`,
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
        return setTimeout(() => sendWebhook(now, then, time), Number(req.headers['retry-after']));
    if (req.status != 204)
        return log(`Unexpected response sending webhook: ${req.status} ${JSON.stringify(req.data)}`);

};

function log(...str: any[]) {
    let time = moment().tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A');
    return console.log(`[${time}]`, ...str);
};

setInterval(pollEndpoint, 10000);
pollEndpoint();