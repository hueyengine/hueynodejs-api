const express = require('express');
const router = express.Router();

const { Article } = require('../../models');

router.get('/', async function (req, res) {
    try {
        const condition = {
            order: [['id', 'DESC']],
        };

        const articles = await Article.findAll(condition);

        res.json({
            status: true,
            message: 'Articles fetched successfully',
            data: {
                articles,
            },
        });
    } catch (error) {
        console.error('Error fetching articles:', error);

        res.status(500).json({
            status: false,
            message: 'Error fetching articles',
            errors: [error.message || 'An error occurred while fetching articles.'],
        });
    }
});

router.get('/:id', async function (req, res) {
    try {
        // 获取文章 ID
        const { id } = req.params;

        // 查询文章
        const article = await Article.findByPk(id);

        if (article) {
            res.json({
                status: true,
                message: '查询文章成功。',
                data: article,
            });
        } else {
            res.status(404).json({
                status: false,
                message: '文章未找到。',
                errors: [`Article with ID ${id} does not exist.`],
            });
        }
        
    } catch (error) {
        res.status(500).json({
            status: false,
            message: '查询文章失败。',
            errors: [error.message],
        });
    }
});

module.exports = router;
