```
.
├── config
│   └── config.json
├── migrations
├── models
│   └── index.js
└── seeders

```

在编辑器中，也可以看到项目中新增了这些东西，现在一一看看，它们是用来干嘛的。

- config：是配置的意思，这里放的也就是sequelize所需要的连接数据库的配置文件。
- migrations：是迁移的意思，如果你需要对数据库做新增表、修改字段、删除表等等操作，就需要在这里添加迁移文件了。而不是像以前那样，使用客户端软件来直接操作数据库。
- models：这里面存放的是模型文件，当我们使用sequelize来执行增删改查时，就需要用这里的模型文件了。每个模型都对应数据库中的一张表。
- seeders，是存放的种子文件。一般会将一些需要添加到数据表的测试数据存在这里。只需要运行一个命令，数据表中就会自动填充进一些用来测试内容的了。

## 建立模型和迁移文件

```
sequelize model:generate --name Article --attributes title:string,content:text
```

## 运行迁移文件
根据需求调整迁移文件，然后运行迁移，生成数据表。


## 建立和运行种子文件
运行一下命令，新建种子文件。
```
sequelize seed:generate --name article
```
完成后，在seeds目录，就看到刚才命令新建的种子文件`20250607030008-article.js`了。该文件内容同样也是分为两个部分，up部分用来填充数据，down部分是反向操作，用来删除数据的。

运行种子文件：
```
sequelize db:seed --seed 20250607030008-article
```