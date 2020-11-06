export namespace NYT_API {
    export interface CountyModel {
        checksum: string;
        race_id: "county-model";
        race_type: "president";
        races: StateData[];
    };
    export interface CountyData {
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
    export interface StateData {
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
};