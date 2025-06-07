
## Sequelize
Sequelize 是一个基于 Node.js 的 **ORM（对象关系映射）库**，用于简化 Node.js 应用与数据库（如 MySQL、PostgreSQL、SQLite 等）的交互。它的核心作用是将数据库操作**抽象为 JavaScript 对象操作**，让开发者无需编写复杂的 SQL 语句。

### **一、Sequelize 的核心作用**
#### 1. **无需手写 SQL**
- **传统方式**：直接编写 SQL 语句（如 `SELECT * FROM users WHERE age > 18`）。
- **Sequelize 方式**：使用 JavaScript 方法替代 SQL（如 `User.findAll({ where: { age: { [Op.gt]: 18 } } })`）。

#### 2. **数据模型化**
- 将数据库表映射为 JavaScript 类（模型），表中的每行数据对应类的实例。
- 例如：`User` 模型对应 `users` 表，`user.name` 对应表中的 `name` 字段。

#### 3. **自动处理数据类型转换**
- 数据库中的 `INT`、`VARCHAR` 等类型自动转换为 JavaScript 的 `Number`、`String` 等。

#### 4. **跨数据库兼容**
- 同一套代码可无缝切换数据库（如从 MySQL 切换到 PostgreSQL）。


### **二、基本使用流程**
以下是 Sequelize 的典型使用步骤，以 Node.js + MySQL 为例：

#### 1. **安装依赖**
```bash
npm install sequelize mysql2
```

#### 2. **连接数据库**
```javascript
const { Sequelize } = require('sequelize');

// 创建连接实例
const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql' // 支持 'mysql' | 'postgres' | 'sqlite' | 'mariadb' 等
});

// 测试连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('连接失败:', error);
  }
}
```

#### 3. **定义数据模型**
```javascript
const { Model, DataTypes } = require('sequelize');

// 定义 User 模型，对应 users 表
class User extends Model {}
User.init({
  // 定义字段及类型
  name: DataTypes.STRING,     // 字符串类型
  age: DataTypes.INTEGER,     // 整数类型
  email: DataTypes.STRING,    // 字符串类型
  isAdmin: {                  // 自定义字段选项
    type: DataTypes.BOOLEAN,
    defaultValue: false       // 默认值
  }
}, {
  sequelize,                  // 关联数据库实例
  modelName: 'User',          // 模型名称
  tableName: 'users'          // 对应表名（可选，默认使用模型名复数）
});
```

#### 4. **同步模型到数据库（创建表）**
```javascript
// 强制同步（开发环境常用，会删除已存在的表）
await User.sync({ force: true });

// 安全同步（仅创建不存在的表）
await User.sync();
```

#### 5. **基本 CRUD 操作**
```javascript
// 创建数据
const user = await User.create({
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
});

// 查询数据
const allUsers = await User.findAll();
console.log(allUsers.map(user => user.name)); // 输出所有用户的姓名

// 更新数据
await user.update({ age: 26 });

// 删除数据
await user.destroy();
```


### **三、核心概念**
#### 1. **模型（Model）**
- 数据库表的抽象表示，通过 `Model.init()` 定义。
- 示例：`User` 模型对应 `users` 表。

#### 2. **实例（Instance）**
- 模型的具体数据行，通过 `create()`、`findOne()` 等方法获取。
- 示例：`const user = await User.findOne()` 返回一个 `User` 实例。

#### 3. **关联（Associations）**
- 定义表之间的关系（如一对一、一对多、多对多）。
- 示例：
  ```javascript
  // 用户与文章的一对多关系
  User.hasMany(Article);
  Article.belongsTo(User);
  ```

#### 4. **查询构建器**
- 提供丰富的查询方法，替代 SQL 语句。
- 示例：
  ```javascript
  // 查询年龄大于 18 且名字包含 "张" 的用户
  const users = await User.findAll({
    where: {
      age: { [Op.gt]: 18 },
      name: { [Op.like]: '%张%' }
    }
  });
  ```


### **四、优势总结**
1. **提高开发效率**：避免编写重复的 SQL 代码。
2. **安全性**：自动处理 SQL 注入问题（通过参数化查询）。
3. **可维护性**：代码结构更清晰，易于理解和维护。
4. **跨平台支持**：无缝切换不同类型的数据库。


### **五、适用场景**
- **中小型项目**：快速开发，减少 SQL 编写。
- **Node.js 后端应用**：与 Express、Koa 等框架结合使用。
- **需要频繁切换数据库的项目**：利用 Sequelize 的跨数据库特性。

如果需要更详细的用法（如事务处理、复杂查询等），可以参考 Sequelize 官方文档：https://sequelize.org/

## sequelize-cli
`sequelize-cli` 是 Sequelize ORM 的官方命令行工具，用于自动化项目初始化、模型管理、数据库迁移（Migrations）和数据填充（Seeds）等任务。它的核心作用是**减少手动配置，提高开发效率**。

### **一、主要功能**
#### 1. **项目初始化**
自动生成 Sequelize 项目的基础结构：
- 配置文件（`config/config.json`）
- 模型目录（`models/`）
- 迁移文件目录（`migrations/`）
- 数据填充文件目录（`seeders/`）

#### 2. **数据库迁移（Migrations）**
- 跟踪数据库 schema 的变更，类似于 Git 对代码的版本控制。
- 通过迁移文件记录每个变更，支持回滚操作。
- 多人协作时确保数据库结构一致。

#### 3. **数据填充（Seeds）**
- 向数据库插入测试数据或初始数据。
- 例如：创建默认管理员账号、初始化基础数据。

#### 4. **模型与迁移文件同步**
根据模型自动生成迁移文件，或从迁移文件反向生成模型。


### **二、常用命令**
#### 1. **初始化项目**
```bash
# 全局安装 sequelize-cli
npm install -g sequelize-cli

# 在项目目录初始化 Sequelize 结构
npx sequelize-cli init
```

#### 2. **模型管理**
```bash
# 创建模型（自动生成模型文件和迁移文件）
npx sequelize-cli model:generate --name User --attributes name:string,age:integer

# 从现有数据库表反向生成模型（需先配置连接）
npx sequelize-cli model:generate --name User --table-name users
```

#### 3. **数据库迁移**
```bash
# 创建空的迁移文件
npx sequelize-cli migration:generate --name create-users-table

# 执行所有未应用的迁移
npx sequelize-cli db:migrate

# 回滚上一次迁移
npx sequelize-cli db:migrate:undo

# 回滚到初始状态
npx sequelize-cli db:migrate:undo:all
```

#### 4. **数据填充**
```bash
# 创建种子文件
npx sequelize-cli seed:generate --name demo-user

# 执行所有种子文件
npx sequelize-cli db:seed:all

# 回滚上一次种子
npx sequelize-cli db:seed:undo

# 回滚所有种子
npx sequelize-cli db:seed:undo:all
```


### **三、配置文件**
初始化后生成的 `config/config.json` 用于配置数据库连接：
```json
{
  "development": {
    "username": "root",
    "password": "password",
    "database": "my_database",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": { ... },
  "production": { ... }
}
```


### **四、迁移文件示例**
自动生成的迁移文件（如 `20230101123456-create-users.js`）：
```javascript
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // 创建表
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    // 删除表（回滚操作）
    return queryInterface.dropTable('Users');
  }
};
```


### **五、种子文件示例**
自动生成的种子文件（如 `20230101123456-demo-user.js`）：
```javascript
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // 插入测试数据
    return queryInterface.bulkInsert('Users', [
      {
        name: '张三',
        age: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '李四',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    // 删除测试数据（回滚操作）
    return queryInterface.bulkDelete('Users', null, {});
  }
};
```


### **六、优势总结**
1. **团队协作友好**：通过迁移文件同步数据库结构，避免手动修改导致的不一致。
2. **环境隔离**：支持开发、测试、生产环境使用不同的配置。
3. **自动化**：减少重复性工作，专注于业务逻辑。
4. **安全回滚**：出现问题时可轻松撤销数据库变更。


### **七、适用场景**
- **中大型项目**：需要严格管理数据库变更历史。
- **团队开发**：确保所有成员的数据库结构一致。
- **生产环境**：避免手动操作数据库带来的风险。

更多详细用法可参考官方文档：https://sequelize.org/docs/v6/other-topics/migrations/