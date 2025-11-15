const express = require("express");
const router = express.Router();
const Transaction = require("../models/transactionModel");

// GET all transactions
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new transaction
router.post("/", async (req, res) => {
    const { type, amount, category, date, description } = req.body;

    try {
        const transaction = new Transaction({
            type,
            amount,
            category,
            date,
            description
        });

        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update transaction by ID
router.put("/:id", async (req, res) => {
    try {
        const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE transaction
router.delete("/:id", async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/summary", async (req, res) => {
    try {
        const month = parseInt(req.query.month); // 1-12
        const year = parseInt(req.query.year);   // 2025, 2024, etc.

        if (!month || !year) {
            return res.status(400).json({ message: "Please provide month and year" });
        }

        // start and end of selected month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        // find all transactions in the interval
        const transactions = await Transaction.find({
            date: { $gte: startDate, $lt: endDate }
        });

        // calculate income and expenses
        const income = transactions
            .filter(t => t.type === "income")
            .reduce((a, b) => a + b.amount, 0);

        const expenses = transactions
            .filter(t => t.type === "expense")
            .reduce((a, b) => a + b.amount, 0);

        const balance = income - expenses;

        res.json({
            month,
            year,
            income,
            expenses,
            balance,
            transactions
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/filter", async (req, res) => {
    try {
        const category = req.query.category;

        if (!category) {
            return res.status(400).json({ message: "Please provide a category" });
        }

        const transactions = await Transaction.find({ category });

        res.json(transactions);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// FILTER by date range
router.get("/date", async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: "Please provide start and end dates" });
        }

        const transactions = await Transaction.find({
            date: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        }).sort({ date: 1 });

        res.json(transactions);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CHART data per month (income vs expense)
router.get("/chart", async (req, res) => {
    try {
        const year = parseInt(req.query.year);
        if (!year) return res.status(400).json({ message: "Please provide a year" });

        // Empty array for each month
        const monthly = Array.from({ length: 12 }, () => ({
            income: 0,
            expense: 0
        }));

        const transactions = await Transaction.find({
            date: {
                $gte: new Date(year, 0, 1),
                $lte: new Date(year, 11, 31)
            }
        });

        transactions.forEach(t => {
            const month = new Date(t.date).getMonth();
            if (t.type === "income") monthly[month].income += t.amount;
            if (t.type === "expense") monthly[month].expense += t.amount;
        });

        res.json(monthly);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CATEGORY totals (for pie chart)
router.get("/categories", async (req, res) => {
    try {
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);

        if (!month || !year)
            return res.status(400).json({ message: "Please provide month and year" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const transactions = await Transaction.find({
            date: { $gte: start, $lt: end },
            type: "expense" // doar cheltuieli pentru pie chart
        });

        const totals = {};

        transactions.forEach(t => {
            if (!totals[t.category]) totals[t.category] = 0;
            totals[t.category] += t.amount;
        });

        res.json(totals);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;