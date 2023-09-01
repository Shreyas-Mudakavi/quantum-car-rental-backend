const transactionModel = require("../Model/Transaction");
const APIFeatures = require("../utils/apiFeatures");

const findAllTransaction = async (req, res) => {
  try {
    const transactionCount = await transactionModel.countDocuments();

    const apiFeature = new APIFeatures(
      transactionModel
        .find()
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("booking"),
      req.query
    ).search("transactionId");

    let transactions = await apiFeature.query;
    let filteredTransactionCount = transactions.length;
    if (req.query.resultPerPage && req.query.currentPage) {
      apiFeature.pagination();

      transactions = await apiFeature.query.clone();
    }
    res
      .status(200)
      .json({ transactions, transactionCount, filteredTransactionCount });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured while fetching all the transaction",
      error: error.message,
    });
  }
};

const transactionDetails = async (req, res) => {
  const transactionId = req.params.id;
  // console.log(transactionId);
  try {
    const transaction = await transactionModel
      .findById(transactionId)
      .populate("user")
      .populate("booking");
    if (!transaction) {
      return res.status(404).json({
        message: "transaction details not exist",
      });
    }
    return res.status(200).json({
      message: "here is  your transaction details",
      transaction: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured while fetching  the transaction details",
      error: error.message,
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await transactionModel.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const deletedTransaction = await transactionModel.findByIdAndDelete(
      transactionId
    );

    res.status(200).json({
      message: "Transaction deleted",
      car: deletedTransaction,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while deleting the transaction",
      error: error.message,
    });
  }
};

module.exports = { findAllTransaction, transactionDetails, deleteTransaction };
