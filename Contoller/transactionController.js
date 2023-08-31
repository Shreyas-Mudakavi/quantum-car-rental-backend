const transactionModel = require('../Model/Transaction');

const findAllTransaction = async (req,res) => {

    try{

        const transaction = await  transactionModel.find({})
                                    .populate('user')
                                    .populate('booking')

            console.log(transaction);                        
        if(!transaction)
        {
            return res.status(404).json({
                message : 'no transaction exists',
            })
        }
        return res.status(200).json({
            message : 'here is all your transaction',
            transaction : transaction
        })

    }
    catch(error)
    {
        return res.status(500).json({
            message : 'An error occured while fetching all the transaction',
            error : error.message
        })
    }

}

const transactionDetails = async (req,res) =>{

        const transactionId = req.params.id;
        // console.log(transactionId);
    try{

        const transaction = await  transactionModel.findById(transactionId).populate('user')
        .populate('booking')
        if(!transaction)
        {
            return res.status(404).json({
                message : 'transaction details not exist',
            })
        }
        return res.status(200).json({
            message : 'here is  your transaction details',
            transaction : transaction
        })

    }
    catch(error)
    {
        return res.status(500).json({
            message : 'An error occured while fetching  the transaction details',
            error : error.message
        })
    }

}

module.exports = {findAllTransaction , transactionDetails};