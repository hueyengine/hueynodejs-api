const express = require('express');
const router = express.Router();

const { Chapter, Course } = require('../../models');
const { Op } = require('sequelize');

const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{rank: (number|*), video: (string|boolean|MediaTrackConstraints|VideoConfiguration|*), title, courseId: (number|*), content}}
 */
function filterBody(req) {
    return {
        courseId: req.body.courseId,
        title: req.body.title,
        content: req.body.content,
        video: req.body.video,
        rank: req.body.rank,
    };
}
/**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
    return {
        attributes: { exclude: ['CourseId'] },
        include: [
            {
                model: Course,
                as: 'course',
                attributes: ['id', 'name'],
            },
        ],
    };
}

/**
 * 查询当前章节
 */
async function getChapter(req) {
    const { id } = req.params;
    const condition = getCondition();

    // 查询章节
    const chapter = await Chapter.findByPk(id, condition);

    if (!chapter) {
        throw new NotFoundError(`Chapter with ID ${id} does not exist.`);
    }

    return chapter;
}

/**
 * 查询所有章节
 * GET /admin/chapters
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;

        const offset = (currentPage - 1) * pageSize;

        if (!query.courseId) {
            throw new Error('获取章节列表失败，课程ID不能为空。');
        }

        const condition = {
            ...getCondition(),
            order: [
                ['rank', 'ASC'],
                ['id', 'ASC'],
            ],
            limit: pageSize,
            offset: offset,
        };

        condition.where = {
            courseId: {
                [Op.eq]: query.courseId,
            },
        };

        if (query.title) {
            condition.where = {
                title: {
                    [Op.like]: `%${query.title}%`,
                },
            };
        }

        const { count, rows } = await Chapter.findAndCountAll(condition);

        success(res, 'Chapters fetched successfully', {
            chapters: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            },
        });
    } catch (error) {
        console.error('Error fetching chapters:', error);
        failure(res, error);
    }
});

/**
 * 查询章节
 * GET /admin/chapters/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const chapter = await getChapter(req);
        success(res, '查询章节成功', { chapter });
    } catch (error) {
        console.error('Error quering chapter detail:', error);
        failure(res, error);
    }
});

/**
 * 创建章节
 * POST /admin/chapters
 */
router.post('/', async function (req, res) {
    try {
        // 白名单过滤
        const body = filterBody(req);

        const chapter = await Chapter.create(body);
        success(res, '章节创建成功', { chapter }, 201);
    } catch (error) {
        console.error('Error creating chapter:', error);
        failure(res, error);
    }
});

/**
 * 更新章节
 * PUT /admin/chapters/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const chapter = await getChapter(req);

        const body = filterBody(req);
        await chapter.update(body);

        success(res, '更新章节成功', { chapter });
    } catch (error) {
        console.error('Error updating chapter:', error);

        failure(res, error);
    }
});

/**
 * 删除章节
 * DELETE /admin/chapters/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const chapter = await getChapter(req);

        await chapter.destroy();

        success(res, '删除章节成功。');
    } catch (error) {
        console.error('Error deleting chapter:', error);

        failure(res, error);
    }
});

module.exports = router;
