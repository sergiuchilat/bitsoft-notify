import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  public constructor() {}

  public async seed(seedMethod: string, cleanInstall = false) {
    try {
      console.log(`Start seeding: ${seedMethod}...`);
      await this[seedMethod](cleanInstall);
      console.log(`Seeding complete: ${seedMethod}.`);
    } catch (e) {
      throw new Error(`Seeder ${seedMethod} not found.`);
    }
  }

  public async seedAll(cleanInstall = false) {
    //await this.seed('channels', cleanInstall);
  }
}
