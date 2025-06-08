# 开发手册

## 一、初始化项目

### 1.1、安装全局包

开发Node.js项目，首先，要全局安装两个包。

|   命令  | 说明 |
| :--------  | :-----  |
| npm i -g express-generator@4 | 安装 express 脚手架 |
| npm i -g sequelize-cli | 安装 sequelize 命令行工具 |

先安装了 express 脚手架，这样就可以用命令创建 Express 项目。接着安装了sequelize-cli，这样才能执行模型、迁移、种子相关的命令。因为它们都是全局安装的，所以在电脑上，只需要运行一次，就不用重复再次安装了。

### 1.2、初始化项目
- 创建项目，并指定不需要视图文件。还要记得，要删除 public/index.html 文件。
- 接着要用 cd 命令，进入项目里。
npm i 安装项目所需依赖包。
- 安装 nodemon，装完后，记得要配置 package.json，这样修改代码后无需重启服务。
- 安装 sequelize 与 mysql2 依赖包。这样项目里才能使用 sequelize 操作 mysql。
- 然后初始化 sequelize，会生成 ORM 所需要的目录和配置文件。记得修改 config/config.json 文件中数据库连接的配置。
- npm start 后，就可以通过http://localhost:3000来访问了。

### 1.3、初始化数据库
- 先要去创建数据库了。也可以使用命令创建，但在部分 Windows 中无法成功创建，那就直接使用 Navicat 手动创建也一样。
- 然后根据需求，去创建模型。记住模型是单数，但是表名是复数。并指定所需字段和类型，同时还会自动生成相关的迁移文件。
- 打开迁移文件后，根据需求人工进行调整。改完后，运行迁移命令，就会自动的创建表了。
- 可以使用种子文件，来给表中添加测试数据，而不用通过 SQL 导入默认测试数据。
- 根据需求调整种子文件。然后运行一下种子，就会自动填充数据到表里了。
- 还有个命令，它会运行所有的种子文件。缺点是无论之前有没有运行过，都会全部重新运行一次。所以这个命令只适合数据库还什么数据都没有的情况下。

|   命令  | 说明 |
| :--------  | :-----  |
| sequelize db:create --charset utf8mb4 --collate utf8mb4_general_ci | 创建数据库 |
| sequelize model:generate --name Article --attributes title:string,content:text | 创建模型 |
| sequelize db:migrate | 运行迁移文件 |
| sequelize seed:generate --name article | 创建种子文件 |
| sequelize db:seed --seed xxx-article | 运行指定种子文件 |
| sequelize db:seed:all | 运行所有种子文件 |

## 二、Express 的路由配置