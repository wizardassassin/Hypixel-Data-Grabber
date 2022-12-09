import prisma from "./database.js";

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function dropDatabase() {
    await prisma.bazaarItemLog.deleteMany();
}
