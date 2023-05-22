const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error)
        process.exit(1)
    })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release-builds')

    return Promise.resolve({
        appDirectory: path.join(rootPath),
        authors: 'FRC 5907',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: '5907 Scouting Manager.exe',
        setupExe: 'ScoutManagerInstaller.exe',
        setupIcon: path.join(rootPath, 'public', 'favicon.ico')
    })
}