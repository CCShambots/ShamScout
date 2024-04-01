export const CURRENT_EVENT = "current-event";
export const ACTIVE_TEMPLATE = "active-template";
export const USE_LOCAL_API = "use-local-api";
export const API_HOST_ADDRESS = "api-host-address";
export const API_MOBILE_HOST_ADDRESS = "api-mobile-address";
export const TEAMS_LIST_VIEW = "teams-list-view";
export const TBA_KEY = "tba-key";
export const TEAM_OVERRIDE = "team-override";
export const JWT = "jwt";
export const EMAIL = "email";

export const MATCHES = (eventKey: string) => `matches-${eventKey}`;
export const TEAMS = (eventKey: string) => `teams-${eventKey}`;
export const BLACKLIST = (eventKey: string) => `blacklist-${eventKey}`;
export const PICKLIST = (eventKey: string) => `pick-list-${eventKey}`;
export const ACCEPT_LIST = (eventKey: string) => `accept-list-${eventKey}`;
export const DECLINE_LIST = (eventKey: string) => `decline-list-${eventKey}`;
export const CHECKLIST = (eventKey: string) => `checklist-${eventKey}`;

export const COMMENTS = (teamNumber:string, year:string) => `comments-${teamNumber}-${year}`;