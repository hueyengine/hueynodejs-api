const express = require('express');
const router = express.Router();

const { Category } = require('../../models');
const { Op } = require('sequelize');

const { NotFoundError, success, failure } = require('../../utils/response');

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{name, rank: (string|*)}}
 */
function filterBody(req) {
    return {
        name: req.body.name,
        rank: req.body,
    };
}

/**
 * 查询当前分类
 */
async function getCategory(req) {
    const { id } = req.params;

    // 查询分类
    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError(`Category with ID ${id} does not exist.`);
    }

    return category;
}

/**
 * 查询所有分类
 * GET /admin/categories
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

        if (query.name) {
            condition.where = {
                name: {
                    [Op.like]: `%${query.name}%`,
                },
            };
        }

        const { count, rows } = await Category.findAndCountAll(condition);

        success(res, 'Categories fetched successfully', {
            categories: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            },
        });
    } catch (error) {
        console.error('Error fetching categories:', error);

        // res.status(500).json({
        //     status: false,
        //     message: 'Error fetching categories',
        //     errors: [error.message || 'An error occurred while fetching categories.'],
        // });
        failure(res, error);
    }
});

/**
 * 查询分类
 * GET /admin/categories/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const category = await getCategory(req);
        success(res, '查询分类成功', category);
    } catch (error) {
        console.error('Error quering category detail:', error);
        // res.status(500).json({
        //     status: false,
        //     message: '查询分类失败。',
        //     errors: [error.message],
        // });

        failure(res, error);
    }
});

/**
 * 创建分类
 * POST /admin/categories
 */
router.post('/', async function (req, res) {
    try {
        // 白名单过滤
        const body = filterBody(req);

        const category = await Category.create(body);
        success(res, '分类创建成功', { category }, 201);
    } catch (error) {
        console.error('Error creating category:', error);
        // res.status(500).json({
        //     status: false,
        //     message: '分类创建失败。',
        //     errors: [error.message || 'An error occurred while creating the category.'],
        // });
        failure(res, error)
    }
});

/**
 * 更新分类
 * PUT /admin/categories/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const category = await getCategory(req);

        const body = filterBody(req);
        await category.update(body);

        success(res, '更新分类成功', { category });
    } catch (error) {
        console.error('Error updating category:', error);
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
        //         message: '创建分类失败。',
        //         errors: [error.message],
        //     });
        // }

        failure(res, error)
    }
});

/**
 * 删除分类
 * DELETE /admin/categories/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const category = await getCategory(req);

        await category.destroy();

        success(res, '删除分类成功。');
    } catch (error) {
        console.error('Error deleting category:', error);
        // res.status(500).json({
        //     status: false,
        //     message: '删除分类失败。',
        //     errors: [error.message],
        // });

        failure(res, error);
    }
});

module.exports = router;
