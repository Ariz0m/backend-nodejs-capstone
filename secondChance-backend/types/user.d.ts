export type User = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type ObjectId = import('mongodb').ObjectId;

export type UserWithId = User & { _id: ObjectId };