const fs = require('fs');
const { ShareServiceClient, StorageSharedKeyCredential } = require("@azure/storage-file-share");
require("dotenv").config();

const account = process.env.ACCOUNT_NAME || "";
const accountKey = process.env.ACCOUNT_KEY || "";

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

const serviceClient = new ShareServiceClient(
    `https://${account}.file.core.windows.net`,
    sharedKeyCredential
);

const shareName = "user-assets";
const shareClient = serviceClient.getShareClient(shareName);
const user = 'divkcs_gmail_com';
const workspace = 'demo_workspace';


async function getFiles(dir, files_) {
    if (typeof files_ === 'undefined') files_ = [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        const buffer = fs.readFileSync(name);
        const fileContent = buffer.toString();
        await copyFilesToAzure(fileContent, files[i]);
    }
}

const copyFilesToAzure = async (content, filename) => {
    try {
        const directoryClient = shareClient.getDirectoryClient(user);
        const directoryClientsub = directoryClient.getDirectoryClient(workspace);
        const fileClient = directoryClientsub.getFileClient(filename);
        const length = content.length;
        await fileClient.create(length);
        await fileClient.uploadRange(content, 0, length);
        console.log({
            message: "Files copied successfully",
            status: 200
        });
    } catch (err) {
        console.log({
            message: `Could not copy files: ${err}`,
            status: 500
        })
    }
}

console.log(getFiles('files'))