import { MistralAIEmbeddings } from "@langchain/mistralai";
import constant from "../constants/constant";

const mistralEmbeddings = new MistralAIEmbeddings({
  apiKey: constant.model.apiKey
});

export default mistralEmbeddings;