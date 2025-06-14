const express = require('express');
const router = express.Router();

const { Setting } = require('../../models');

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
 * 查询当前系统设置
 */
async function getSetting() {
    // 查询系统设置
    const setting = await Setting.findOne();

    if (!setting) {
        throw new NotFoundError(`Setting with ID ${id} does not exist.`);
    }

    return setting;
}

/**
 * 查询系统设置详情
 * GET /admin/settings
 */
router.get('/', async function (req, res) {
    try {
        const setting = await getSetting();
        success(res, '查询系统设置成功', { setting });
    } catch (error) {
        console.error('Error quering setting detail:', error);
        failure(res, error);
    }
});

/**
 * 更新系统设置
 * PUT /admin/settings
 */
router.put('/', async function (req, res) {
    try {
        const setting = await getSetting();

        const body = filterBody(req);
        await setting.update(body);

        success(res, '更新系统设置成功', { setting });
    } catch (error) {
        console.error('Error updating setting:', error);
        failure(res, error)
    }
});

module.exports = router;
