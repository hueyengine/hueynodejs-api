const express = require('express');
const router = express.Router();

const { Article } = require('../../models');
const { Op } = require('sequelize');

const { NotFoundError, success, failure } = require('../../utils/response');

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{title, content: (string|string|DocumentFragment|*)}}
 */
function filterBody(req) {
    return {
        title: req.body.title,
        content: req.body.content,
    };
}

/**
 * 查询当前文章
 */
async function getArticle(req) {
    const { id } = req.params;

    // 查询文章
    const article = await Article.findByPk(id);

    if (!article) {
        throw new NotFoundError(`Article with ID ${id} does not exist.`);
    }

    return article;
}

/**
 * 查询所有文章
 * GET /admin/articles
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;

        const offset = (currentPage - 1) * pageSize;
        console.log('Query parameters:', query);

        const condition = {
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        };

        if (query.title) {
            condition.where = {
                title: {
                    [Op.like]: `%${query.title}%`,
                },
            };
        }

        const { count, rows } = await Article.findAndCountAll(condition);

        success(res, 'Articles fetched successfully', {
            articles: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            },
        });
    } catch (error) {
        console.error('Error fetching articles:', error);

        // res.status(500).json({
        //     status: false,
        //     message: 'Error fetching articles',
        //     errors: [error.message || 'An error occurred while fetching articles.'],
        // });
        failure(res, error);
    }
});

/**
 * 查询文章
 * GET /admin/articles/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const article = await getArticle(req);
        success(res, '查询文章成功', article);
    } catch (error) {
        console.error('Error quering article detail:', error);
        // res.status(500).json({
        //     status: false,
        //     message: '查询文章失败。',
        //     errors: [error.message],
        // });

        failure(res, error);
    }
});

/**
 * 创建文章
 * POST /admin/articles
 */
router.post('/', async function (req, res) {
    try {
        // 白名单过滤
        const body = filterBody(req);

        const article = await Article.create(body);
        success(res, '文章创建成功', { article }, 201);
    } catch (error) {
        console.error('Error creating article:', error);
        // res.status(500).json({
        //     status: false,
        //     message: '文章创建失败。',
        //     errors: [error.message || 'An error occurred while creating the article.'],
        // });
        failure(res, error)
    }
});

/**
 * 更新文章
 * PUT /admin/articles/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const article = await getArticle(req);

        const body = filterBody(req);
        await article.update(body);

        success(res, '更新文章成功', { article });
    } catch (error) {
        console.error('Error updating article:', error);
        // if (error.name === 'SequelizeValidationError') {
        //     const errors = error.errors.map((e) => e.message);

        //     res.status(400).json({
        //         status: false,
        //         message: '请求参数错误。',
        //         errors,
        //     });
        // } else {
        //     res.status(500).json({
        //         status: false,
        //         message: '创建文章失败。',
        //         errors: [error.message],
        //     });
        // }

        failure(res, error)
    }
});

/**
 * 删除文章
 * DELETE /admin/articles/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const article = await getArticle(req);

        await article.destroy();

        success(res, '删除文章成功。');
    } catch (error) {
        console.error('Error deleting article:', error);
        // res.status(500).json({
        //     status: false,
        //     message: '删除文章失败。',
        //     errors: [error.message],
        // });

        failure(res, error);
    }
});

module.exports = router;
