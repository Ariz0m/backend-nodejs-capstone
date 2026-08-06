export type SecondChanceItem = {
    id: string;
    name: string;
    category: string;
    condition: string;
    posted_by: string;
    zipcode: string;
    date_added: number;
    age_days: number;
    age_years: number;
    description: string;
    image: string;
    comments: SecondChanceComment[]
}

type SecondChanceComment = {
    author: string;
    comment: string;
}

import { ObjectId } from "mongodb";
export type SecondChanceItemWithId = SecondChanceItem & { _id: ObjectId };
