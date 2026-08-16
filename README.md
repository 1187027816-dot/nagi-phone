# 弯弯机部署教程

弯弯机是一个可以直接部署到浏览器使用的静态应用。本项目不需要服务器、不需要安装依赖，也不需要执行构建命令。

推荐将仓库连接到 Netlify。完成一次设置后，只要 GitHub 仓库有新提交，Netlify 就会自动发布新版。没有 GitHub 账户时，也可以直接上传项目文件夹。

## 部署前准备

推荐方案需要：

- 一个 [GitHub](https://github.com/) 账户
- 一个 [Netlify](https://app.netlify.com/signup) 账户

手动上传只需要下载好的项目文件。

## 方案一：连接 GitHub 自动部署「推荐」

### 1. Fork 本仓库

1. 打开本项目的 GitHub 仓库页面。
2. 点击页面右上角的 **Fork**。
3. 点击 **Create fork**，把项目复制到你自己的 GitHub 账户。

以后可以在自己的仓库页面点击 **Sync fork** 同步本项目的更新。同步产生新提交后，Netlify 会自动重新部署。

### 2. 在 Netlify 导入仓库

1. 登录 [Netlify](https://app.netlify.com/)。
2. 在团队首页点击 **Add new project**。
3. 选择 **Import an existing project**。
4. 选择 **GitHub**，按提示授权 Netlify 访问你的 GitHub 仓库。
5. 在仓库列表中选择刚刚 Fork 的弯弯仓库。如果找不到它，请在 GitHub 授权设置中允许 Netlify 访问该仓库。

### 3. 填写部署设置

在发布前确认以下设置：

| 设置 | 填写内容 |
| --- | --- |
| Production branch | 保持默认，通常是 `main` 或 `master` |
| Base directory | 留空 |
| Build command | 留空 |
| Publish directory | `.` |
| Environment variables | 不需要添加 |

然后点击 **Publish**。等待部署状态显示为已发布后，打开 Netlify 提供的 `https://项目名称.netlify.app` 地址即可使用。

> 如果新建的 Netlify 团队默认启用了私有项目，部署完成后可能只有团队成员能访问。需要公开分享时，请在 Netlify 的项目访问设置中将它改为公开。

### 4. 更新网站

连接 GitHub 后，Netlify 会监听生产分支：

- 你向自己的生产分支提交或合并修改后，Netlify 会自动部署。
- 上游项目发布更新后，先在 GitHub 的 Fork 页面点击 **Sync fork**；同步完成后，Netlify 会自动部署。
- 可以在 Netlify 项目中的 **Deploys** 页面查看进度、日志和历史版本。

## 方案二：手动上传到 Netlify

这种方式不需要连接 GitHub，但每次更新都要重新上传。

1. 在 GitHub 仓库页面点击 **Code**，再点击 **Download ZIP**。
2. 解压下载的 ZIP。
3. 打开解压后的文件夹，确认第一层能直接看到 `index.html`、`css`、`js`、`img` 等内容。
4. 登录 Netlify 后打开 [Netlify Drop](https://app.netlify.com/drop)。
5. 把整个项目文件夹拖到上传区域。
6. 上传完成后，打开 Netlify 提供的 `netlify.app` 地址。

更新手动部署的网站时，先下载并解压新版项目，再进入原来的 Netlify 项目，在 **Deploys** 页面的上传区域拖入更新后的完整文件夹。

## 部署后的常用设置

### 修改网站地址

Netlify 会自动生成一个随机的 `netlify.app` 地址。可以在项目设置中修改项目名称，从而更改这个地址。

如需使用自己的域名，请进入 **Domain management** > **Production domains**，再选择 **Add a domain**。具体步骤可参考 [Netlify 自定义域名文档](https://docs.netlify.com/manage/domains/manage-domains/assign-a-domain-to-your-site-app/)。

### 添加到手机主屏幕

弯弯机支持作为网页应用安装：

- **iPhone / iPad（Safari）**：打开网站，点击分享按钮，选择“添加到主屏幕”。
- **Android（Chrome）**：打开网站，点击浏览器菜单，选择“安装应用”或“添加到主屏幕”。

## 数据与隐私

- 聊天、角色、设置和 API 配置等数据主要保存在当前浏览器的本地存储中，不会因为部署到 Netlify 就自动上传到 Netlify。
- 更换设备、浏览器、无痕窗口或网站域名后，会被视为一个新的本地数据空间。清除浏览器的网站数据也可能删除已有内容。
- 更换设备、浏览器或域名前，请先在弯弯中导出数据备份，再在新地址中导入。
- 模型服务的 API 地址和 API Key 应在弯弯的设置页面中填写，不需要放进 Netlify 环境变量，也不要直接写进公开仓库的代码。
- 页面会从外部 CDN 加载部分程序和图标，并使用部分外部图片资源，因此使用时需要网络连接。

## 常见问题

### 部署后显示 404 或 Page not found

检查 Netlify 的 **Publish directory** 是否为 `.`，并确认 `index.html` 位于上传或仓库的根目录，而不是多套了一层文件夹。

### 页面能打开，但没有样式或部分功能不能使用

确认项目内容上传完整，尤其不要遗漏 `css`、`js`、`img` 和 `audio` 文件夹。然后在 Netlify 的 **Deploys** 页面重新部署。

### GitHub 更新后，网站没有变化

1. 确认修改已经进入 Netlify 设置的生产分支。
2. 在 Netlify 的 **Deploys** 页面确认是否产生了新部署，以及部署是否成功。
3. 重新打开网站；如仍显示旧内容，清除该网站的浏览器缓存后再试。

### 换了域名或项目地址后，原来的数据不见了

这是浏览器的数据隔离机制。不同域名会使用不同的本地数据空间。回到旧地址导出备份，再到新地址导入即可。

### 在 Netlify 中找不到 GitHub 仓库

重新连接 GitHub，并在授权页面允许 Netlify 访问该仓库。组织账户中的仓库可能还需要组织管理员批准 Netlify 的访问权限。

## 相关文档

- [Netlify：从 Git 仓库部署](https://docs.netlify.com/start/quickstarts/deploy-from-repository/)
- [Netlify Drop 使用说明](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/)
