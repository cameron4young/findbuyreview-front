import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface UserPreferenceDoc extends BaseDoc {
  userId: ObjectId;
  interests: string[];
  age: number;
  location: string;
  lookingFor: string;
  favoriteCompanies: string[];
  doNotShow: string[];
}

export default class PreferencesConcept {
  public readonly preferences: DocCollection<UserPreferenceDoc>;

  constructor(collectionName: string) {
    this.preferences = new DocCollection<UserPreferenceDoc>(collectionName);
  }

  async createUserPreferenceDoc(
    userId: ObjectId,
    interests: string[] = [],
    age: number = -1,
    location: string = "",
    lookingFor: string = "",
    favoriteCompanies: string[] = [],
    doNotShow: string[] = [],
  ) {
    const existingPreferences = await this.preferences.readOne({ userId: userId });
    if (existingPreferences) {
      throw new Error("User already has preferences.");
    }
    await this.preferences.createOne({
      _id: userId,
      userId,
      interests,
      age,
      location,
      lookingFor,
      favoriteCompanies,
      doNotShow,
    });
    return {
      message: "Profile successfully created",
    };
  }

  async addInterest(userId: ObjectId, interest: string) {
    const userPreferences = await this.preferences.readOne({ userId: userId });
    if (userPreferences) {
      let newArray = userPreferences.interests;
      console.log(newArray);
      if (!newArray.includes(interest)) {
        newArray.concat(interest);
      }
      await this.preferences.partialUpdateOne({ userId: userId }, { interests: newArray });
    }
  }

  async updateInterests(userId: ObjectId, newInterests: string[]) {
    await this.preferences.partialUpdateOne({ userId: userId }, { interests: newInterests });
  }

  async addFavoriteCompany(userId: ObjectId, company: string) {
    const userPreferences = await this.preferences.readOne({ userId: userId });
    if (userPreferences) {
      let newArray = userPreferences.favoriteCompanies;
      if (!newArray.includes(company)) {
        newArray.concat(company);
      }
      await this.preferences.partialUpdateOne({ userId: userId }, { favoriteCompanies: newArray });
    }
  }

  async updateFavoriteCompanies(userId: ObjectId, newFavoriteCompanies: string[]) {
    await this.preferences.partialUpdateOne({ userId: userId }, { favoriteCompanies: newFavoriteCompanies });
  }

  async blockContent(userId: ObjectId, block: string) {
    console.log(userId, block);
    const userPreferences = await this.preferences.readOne({ userId: userId });
    if (userPreferences) {
      let newArray = userPreferences.doNotShow;
      if (!(block in newArray)) {
        newArray = newArray.concat(block);
      }
      if (block in userPreferences.interests) {
        let index = userPreferences.interests.indexOf(block);
        userPreferences.interests.splice(index, 1);
      }
      await this.preferences.partialUpdateOne({ userId: userId }, { doNotShow: newArray });
    }
  }

  async updateDoNotShow(userId: ObjectId, newDoNotShowList: string[]) {
    const userPreferences = await this.preferences.readOne({ userId: userId });
    if (userPreferences) {
      const updatedInterests = userPreferences.interests.filter((interest) => !newDoNotShowList.includes(interest));
      await this.preferences.partialUpdateOne(
        { userId: userId },
        {
          doNotShow: newDoNotShowList,
          interests: updatedInterests,
        },
      );
    }
  }

  async updateLocation(userId: ObjectId, newLocation: string) {
    await this.preferences.partialUpdateOne({ userId: userId }, { location: newLocation });
  }

  async updateAge(userId: ObjectId, newAge: number) {
    await this.preferences.partialUpdateOne({ userId: userId }, { age: newAge });
  }

  async updateLookingFor(userId: ObjectId, newLookingFor: string) {
    await this.preferences.partialUpdateOne({ userId: userId }, { lookingFor: newLookingFor });
  }

  async getPreferences(userId: ObjectId): Promise<UserPreferenceDoc | null> {
    return await this.preferences.readOne({ userId: userId });
  }
}
