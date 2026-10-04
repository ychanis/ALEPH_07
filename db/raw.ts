import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('저장소를 사용할 수 없습니다.');return env.DB;}
