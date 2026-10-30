; ==============================================================================
; AirBattle Remastered // 战机凌云
; Inno Setup 6 安装程序打包脚本 (Inno Setup Script)
;
; 使用说明:
; 1. 终端执行 `npm run pack` 生成解压版桌面应用 (目录位于 `release\win-unpacked\`)
; 2. 打开 Inno Setup Compiler 并载入此 `installer.iss` 文件
; 3. 点击顶部 "Build" -> "Compile" (或在命令行执行 `iscc installer.iss`)
; 4. 生成的完整单文件安装包将输出至 `release\installer\AirBattle_Setup_v1.0.0.exe`
; ==============================================================================

#define MyAppName "AirBattle"
#define MyAppNameZh "战机凌云 (AirBattle)"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Yodeeshi Studio"
#define MyAppURL "https://github.com/yodeeshi/AirBattle"
#define MyAppExeName "AirBattle.exe"

[Setup]
; 基础信息与唯一 GUID 标识符
AppId={{C8E1D9B2-3F5A-4B6E-9C8D-1A2B3C4D5E6F}
AppName={#MyAppNameZh}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; 安装路径默认为系统 Program Files\AirBattle
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppNameZh}
AllowNoIcons=yes

; 打包输出目录与文件名
OutputDir=release\installer
OutputBaseFilename=AirBattle_Setup_v1.0.0

; 高压缩比配置 (LZMA2 Ultra 64-bit)
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
DisableProgramGroupPage=yes

; 权限需求 (普通用户或管理员均可安全运行)
PrivilegesRequiredOverridesAllowed=commandline dialog

[Languages]
Name: "chinesesimplified"; MessagesFile: "ChineseSimplified.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
; 打包 release\win-unpacked 目录下的全部应用二进制与运行时资源
Source: "release\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppNameZh}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppNameZh}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppNameZh}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppNameZh, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
