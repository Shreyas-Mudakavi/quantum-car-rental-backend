const queriesModel = require("../Model/Query");
const APIFeatures = require("../utils/apiFeatures");

const addQuery = async (req, res, next) => {
  const { name, email, message } = req.body;

  try {
    const newQuery = await queriesModel({
      name: name,
      email: email,
      message: message,
    });

    const savedQuery = await newQuery.save();

    res.status(201).json({ savedQuery: savedQuery });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getAllQueries = async (req, res, next) => {
  try {
    const queriesCount = await queriesModel.countDocuments();

    const apiFeature = new APIFeatures(
      queriesModel.find().sort({ createdAt: -1 }),
      req.query
    ).search("name");

    let queries = await apiFeature.query;
    let filteredQueriesCount = queries.length;
    if (req.query.resultPerPage && req.query.currentPage) {
      apiFeature.pagination();

      queries = await apiFeature.query.clone();
    }

    res.status(200).json({ queries, queriesCount, filteredQueriesCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getQuery = async (req, res, next) => {
  try {
    const query = await queriesModel.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query details not found!" });
    }

    res.status(200).json({ query: query });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const deleteQuery = async (req, res, next) => {
  try {
    const query = await queriesModel.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query details not found!" });
    }

    await queriesModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Query deleted!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { addQuery, getAllQueries, getQuery, deleteQuery };
