import { MongoClient } from "mongodb";

class MongoDB {
  // using static variable to make connect singleton -> only one instance can exist
  static connect = async (url) => {
    if (this.client) return this.client;
    this.client = await MongoClient.connect(url);
    return this.client;
  };
}

export default MongoDB;
