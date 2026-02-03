import nlp from 'compromise';
import * as natural from 'natural';
import { City } from 'country-state-city';

export interface ParsedSignature {
    company?: string;
    title?: string;
    locations: string[];
    skills: string[];
    type: 'JOB' | 'INTERNSHIP' | 'WALKIN';
    allowedPassoutYears: number[];
    isFresherOnly: boolean;
    allowedDegrees: string[];
    isRemote: boolean;
}

export class ParserService {
    private static tfidf = new natural.TfIdf();
    private static stopWords = ['requirements', 'eligibility', 'apply', 'link', 'official', 'company', 'hiring', 'salary'];

    /**
     * Main entry point to parse raw job text
     */
    static parse(text: string): ParsedSignature {
        const doc = nlp(text);

        // 1. Extract Locations (using compromise entities)
        const rawLocations = doc.places().out('array') as string[];

        // Use country-state-city to verify locations (Zero AI verification)
        const validLocations = rawLocations.filter(loc => {
            const cityName = loc.trim();
            // Checking in India by default as per project context
            return City.getCitiesOfCountry('IN')?.some(c =>
                c.name.toLowerCase() === cityName.toLowerCase()
            );
        });

        const locations = validLocations.length > 0 ? validLocations : rawLocations;

        // 2. Determine Type
        let type: 'JOB' | 'INTERNSHIP' | 'WALKIN' = 'JOB';
        const textLower = text.toLowerCase();
        if (textLower.includes('walkin') || textLower.includes('walk-in') || textLower.includes('drive')) {
            type = 'WALKIN';
        } else if (textLower.includes('internship') || textLower.includes('stipend')) {
            type = 'INTERNSHIP';
        }

        // 3. Extract Company (Heuristic: usually one of the first proper nouns)
        const organizations = doc.organizations().out('array');
        const company = organizations.length > 0 ? organizations[0] : undefined;

        // 4. Extract Years (2020-2029)
        const yearRegex = /\b(202[0-9]|20[0-2][0-9])\b/g;
        const foundYears = text.match(yearRegex) || [];
        const allowedPassoutYears = Array.from(new Set(foundYears.map(y => parseInt(y))));

        const isFresherOnly = textLower.includes('fresher') || textLower.includes('freshers');

        // 5. Extract Education Levels
        const allowedDegrees: string[] = [];
        if (/\b(diploma)\b/i.test(text)) allowedDegrees.push('DIPLOMA');
        if (/\b(bachelor|degree|b\.?tech|b\.?e|bsc|b\.?sc|bcom|b\.?com)\b/i.test(text)) allowedDegrees.push('DEGREE');
        if (/\b(master|pg|post.?graduate|m\.?tech|m\.?e|mca|mba)\b/i.test(text)) allowedDegrees.push('PG');

        // 6. Extract Skills using Natural (Keyword extraction)
        this.tfidf.addDocument(text);

        // We look for capitalized words or known tech patterns (simplified for now)
        const terms = doc.nouns().out('array') as string[];
        const uniqueTerms = Array.from(new Set(terms))
            .filter((t: string) => t.length > 1 && !this.stopWords.includes(t.toLowerCase()));

        return {
            company,
            locations: locations as string[],
            type,
            allowedPassoutYears,
            isFresherOnly,
            allowedDegrees,
            skills: uniqueTerms.slice(0, 5) as string[], // Top 5 nouns as skills
            isRemote: textLower.includes('remote') || textLower.includes('work from home'),
        };
    }
}
