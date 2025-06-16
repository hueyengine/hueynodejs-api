const express = require('express');
const router = express.Router();
const { Course, Category, User, Chapter } = require('../../models');

const { Op } = require('sequelize');

const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{image: *, name, introductory: (boolean|*), userId: (number|*), categoryId: (number|*), content, recommended: (boolean|*)}}
 */
function filterBody(req) {
    return {
        categoryId: req.body.categoryId,
        userId: req.body.userId,
        name: req.body.name,
        image: req.body.image,
        recommended: req.body.recommended,
        introductory: req.body.introductory,
        content: req.body.content,
    };
}

/**
 * 公共方法：关联分类、用户数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
    return {
        attributes: { exclude: ['CategoryId', 'UserId'] },
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'],
            },
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar'],
            },
        ],
    };
}

/**
 * 查询当前课程
 */
async function getCourse(req) {
    const { id } = req.params;

    const condition = getCondition();

    // 查询课程
    const course = await Course.findByPk(id, condition);

    if (!course) {
        throw new NotFoundError(`Course with ID ${id} does not exist.`);
    }

    return course;
}

/**
 * 查询课程列表
 * GET /admin/courses
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;

        const offset = (currentPage - 1) * pageSize;

        const condition = {
            ...getCondition(),
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        };

        if (query.categoryId) {
            condition.where = {
                categoryId: {
                    [Op.eq]: query.categoryId,
                },
            };
        }

        if (query.userId) {
            condition.where = {
                userId: {
                    [Op.eq]: query.userId,
                },
            };
        }

        if (query.name) {
            condition.where = {
                name: {
                    [Op.like]: `%${query.name}%`,
                },
            };
        }

        if (query.recommended) {
            condition.where = {
                recommended: {
                    // 需要转布尔值
                    [Op.eq]: query.recommended === 'true',
                },
            };
        }

        if (query.introductory) {
            condition.where = {
                introductory: {
                    [Op.eq]: query.introductory === 'true',
                },
            };
        }

        const { count, rows } = await Course.findAndCountAll(condition);

        success(res, 'Courses fetched successfully', {
            courses: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            },
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        failure(res, error);
    }
});

/**
 * 查询课程详情
 * GET /admin/courses/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const course = await getCourse(req);
        success(res, '查询课程成功', { course });
    } catch (error) {
        console.error('Error quering course detail:', error);
        failure(res, error);
    }
});

/**
 * 创建课程
 * POST /admin/courses
 */
router.post('/', async function (req, res) {
    try {
        // 白名单过滤
        const body = filterBody(req);

        const course = await Course.create(body);
        success(res, '课程创建成功', { course }, 201);
    } catch (error) {
        console.error('Error creating course:', error);
        failure(res, error);
    }
});

/**
 * 更新课程
 * PUT /admin/courses/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const course = await getCourse(req);

        const body = filterBody(req);
        await course.update(body);

        success(res, '更新课程成功', { course });
    } catch (error) {
        console.error('Error updating course:', error);

        failure(res, error);
    }
});

/**
 * 删除课程
 * DELETE /admin/courses/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const course = await getCourse(req);

        const count = await Chapter.count({ where: { courseId: req.params.id } });
        if (count > 0) {
            throw new Error('当前课程有章节，无法删除。');
        }

        await course.destroy();

        success(res, '删除课程成功。');
    } catch (error) {
        console.error('Error deleting course:', error);

        failure(res, error);
    }
});

module.exports = router;
