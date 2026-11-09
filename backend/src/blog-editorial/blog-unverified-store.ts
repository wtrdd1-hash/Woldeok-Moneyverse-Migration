import fs from 'node:fs';
import path from 'node:path';
import type { OriginalArticle } from './blog-original-quality';
import type { BlogRotationSlot } from './blog-two-hour-rotation';

/** Independent, explicitly UNVERIFIED public store; never forge DB verification receipts. */
export const UNVERIFIED_BLOG_FILE = '/srv/moneyverse-data/shared/blog-unverified-posts.json';
export function unverifiedStorePath(): string {
  // Exact hardcoded location per channel; never use arbitrary caller path/env URL.
  return process.env.BLOG_PUBLISHER_CHANNEL === 'test'
    ? '/srv/moneyverse-data/shared/blog-unverified-test-posts.json'
    : UNVERIFIED_BLOG_FILE;
}


export interface UnverifiedPublicPost extends OriginalArticle {
  slug: string;
  excerpt: string;
  category: 'TECH' | 'MACRO';
  categoryLabel: string;
  author: {name:string;role:string;badge:string};
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  tags: string[];
  relatedCalculatorHref: string;
  relatedCalculatorName: string;
  isAiGenerated: true;
  views: number;
  country: BlogRotationSlot['country'];
  status: 'PUBLISHED' | 'WITHDRAWN';
  verificationState: 'UNVERIFIED';
  qualityIssues: string[];
  periodKey: string;
}

export function readUnverifiedPosts(file = unverifiedStorePath()): UnverifiedPublicPost[] {
  try {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 16_000_000) throw new Error('UNVERIFIED_STORE_UNSAFE');
    const data:unknown=JSON.parse(fs.readFileSync(file,'utf8'));
    if (!Array.isArray(data)) throw new Error('UNVERIFIED_STORE_INVALID');
    return data as UnverifiedPublicPost[];
  } catch(error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

/** Invoked only within the PostgreSQL leader advisory lock. */
export function publishUnverifiedArticle(
  slot:BlogRotationSlot, draft:OriginalArticle, qualityIssues:readonly string[],
  file = unverifiedStorePath(),
): { inserted:boolean; slug:string; status:'PUBLISHED'|'WITHDRAWN' } {
  const prior=readUnverifiedPosts(file);
  const existing=prior.find(post=>post.periodKey===slot.periodKey);
  if (existing) return { inserted:false,slug:existing.slug,status:existing.status };
  if (draft.content.length<500 || draft.content.length>25000 || draft.title.length<15 ||
    /<script\b|<iframe\b|javascript:/i.test(draft.content)) throw new Error('UNVERIFIED_CONTENT_UNSAFE');
  const now=new Date().toISOString();
  const slug=`${slot.editorialDay}-${slot.country.toLowerCase()}-${slot.topic.toLowerCase()}-${slot.slotIndex}-unverified`;
  const post:UnverifiedPublicPost={
    ...draft,slug,category:slot.topic==='ECONOMY'?'MACRO':'TECH',
    categoryLabel:slot.topic==='ECONOMY'?'Economics':'Technology',
    author:{name:'Woldeok Editorial AI',role:'AI-generated, unverified',badge:'AI'},
    publishedAt:now,updatedAt:now,readTimeMinutes:Math.max(1,Math.ceil(draft.content.length/600)),
    tags:[slot.country,slot.topic,'AI','unverified'],
    relatedCalculatorHref:slot.topic==='ECONOMY'?'/tools/compound-calculator':'/blog',
    relatedCalculatorName:slot.topic==='ECONOMY'?'Calculator':'Blog',
    isAiGenerated:true,views:0,country:slot.country,status:'PUBLISHED',
    verificationState:'UNVERIFIED',qualityIssues:[...qualityIssues],periodKey:slot.periodKey,
  };
  if (!fs.existsSync(path.dirname(file))) throw new Error('UNVERIFIED_STORE_DIR_MISSING');
  const temp=`${file}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temp,JSON.stringify([post,...prior]),{encoding:'utf8',mode:0o600,flag:'wx'});
    fs.renameSync(temp,file);
  } finally {
    try {fs.unlinkSync(temp);} catch(error) { if ((error as NodeJS.ErrnoException).code!=='ENOENT') throw error; }
  }
  return {inserted:true,slug,status:'PUBLISHED'};
}
