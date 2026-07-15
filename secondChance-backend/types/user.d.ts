export type User = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    createdAt: Date;
}

/**
 * @typedef {import('mongodb').ObjectId} ObjectId
 */

export type UserWithId = User & { _id: ObjectId };