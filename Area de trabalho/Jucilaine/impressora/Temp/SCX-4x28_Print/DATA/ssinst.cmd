//
// Version Spec
// X.AA.BB 
// AA: Model Version BB: Data file Version 
//
// Installer command file V 2.00.02
//
/*

 Version : 2.00.00
  - Init
  
 1) 2006.06.01 :
	  - Version : V2.00.01
	  - Description :
	  	. change "Guide.pdf" => %USER_GUIDE_NAME%

 2) 2006.12.05 :
	  - Version : V2.00.02
	  - Description :
	  	. Add key : VALUE = REG_SZ,Publisher,Samsung Electronics CO.,LTD in [ADD_REG.UNINSTKEY]
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//																										//
//												Command Section											//			
//																										//
//////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////
// 		Install Start command			//
//////////////////////////////////////////

[INST_STRART_CMD]
CT_DELETE_FILE = DEVICEINFO_DELETE

[INST_STRART_CMD.END]


//////////////////////////////////////////
//		Installing command			//
//////////////////////////////////////////
[INST_INSTALLING_CMD]
CT_ADDREG = ADD_REG.USER_GUIDE
[INST_INSTALLING_CMD.END]

//////////////////////////////////////////
//		Install End  command			//
//////////////////////////////////////////
[INST_END_CMD]
CT_ADDREG = ADD_REG.PRINTER119_DELETE_ALL
[INST_END_CMD.END]



//////////////////////////////////////////
// 		Restall Start command			//
//////////////////////////////////////////

[REINST_STRART_CMD]

[REINST_STRART_CMD.END]

//////////////////////////////////////////
// 		Restall installing command				//
//////////////////////////////////////////

[REINST_INSTALLING_CMD]

[REINST_INSTALLING_CMD.END]


//////////////////////////////////////////
// 		Restall End command				//
//////////////////////////////////////////

[REINST_END_CMD]

[REINST_END_CMD.END]



//////////////////////////////////////////
// 		Unstall Start command			//
//////////////////////////////////////////

[UNINST_STRART_CMD]

[UNINST_STRART_CMD.END]


//////////////////////////////////////////
// 		Unstall installing command				//
//////////////////////////////////////////

[UNINST_INSTALLING_CMD]
[UNINST_INSTALLING_CMD.END]


//////////////////////////////////////////
// 		Unstall End command				//
//////////////////////////////////////////

[UNINST_END_CMD]
[UNINST_END_CMD.END]



//////////////////////////////////////////////////////////////////////
//																	//		
// 							Copy file section						//
//																	//
//////////////////////////////////////////////////////////////////////
[COPY_FILE_INFO]

COPYFILE_DATA
COPYFILE_SETUP

COPYFILE_DR_PRINTER_ICON
COPYFILE_MANUAL
COPYFILE_MANUAL_VIEWER
COPYFILE_ACROBAT

COPYFILE_SPANEL
COPYFILE_SPANEL_PANELMGR
COPYFILE_SPANEL_SETLANG
COPYFILE_SPANEL_SHARED
COPYFILE_SPANEL_SPANEL
COPYFILE_SPANEL_SPANEL_LANG
COPYFILE_SPANEL_SPANEL_PSU
COPYFILE_SPANEL_SPANEL_HELP_FLASH
COPYFILE_SPANEL_SPANEL_HELP_HELP

COPYFILE_SPANEL_SPANEL_SWF

COPYFILE_SPANEL_SPANEL_RCP

COPYFILE_HTML_GUIDE_COMMON
COPYFILE_HTML_GUIDE

[COPY_FILE_INFO_END]


[COPYFILE_DATA]
DESCRIPTION = @FILE_COPY.INSTALLATION@
SOURCE = $SRC_DIR$\data
DESTINATION = $DEST_INST_DIR$\data
COPY_SUBDIR = 1

[COPYFILE_SETUP]
DESCRIPTION = @FILE_COPY.INSTALLATION@
SOURCE = $SRC_DIR$
DESTINATION = $DEST_INST_DIR$
COPY_SUBDIR = 0

[COPYFILE_DR_PRINTER_ICON]
DESCRIPTION = @FILE_COPY.INSTALLATION@
SOURCE = $SRC_DIR$\data\Dr. Printer Icon.ico
DESTINATION = $WIN_DIR$\Dr. Printer Icon.ico
DELETE = 0

[COPYFILE_MANUAL]
DESCRIPTION = @FILE_COPY.MANUAL@
SOURCE = %USER_GUIDE_DIR%
DESTINATION = $DEST_INST_DIR$\MANUAL\$ORG_LANG_DIR$

[COPYFILE_MANUAL_VIEWER]
DESCRIPTION = @FILE_COPY.MANUAL@
SOURCE = $SRC_DIR$\DATA\Ssopen.exe
DESTINATION = $DEST_INST_DIR$\DATA\Ssopen.exe

[COPYFILE_ACROBAT]
DESCRIPTION = @FILE_COPY.ACROBATREADER@
SOURCE = $SRC_DIR$\@ACROBATREADER_PATH@
DESTINATION = $DEST_INST_DIR$\@ACROBATREADER_PATH@

[COPYFILE_SM]
DESCRIPTION = @COMPONENT.SM@
SOURCE = %SM_DIR%
DESTINATION = $DEST_INST_DIR$\Application\SM
COPY_SUBDIR = 1

[COPYFILE_RCP]
DESCRIPTION = @COMPONENT.RCP@
SOURCE = %RCP_DIR%
DESTINATION = $DEST_INST_DIR$\Application\RCP
COPY_SUBDIR = 1


/////////////////////// COPYFILE_SPANEL //////////////////////////

[COPYFILE_SPANEL]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%
DESTINATION = $DEST_INST_DIR$\Application\SPANEL
COPY_SUBDIR = 0

[COPYFILE_SPANEL_PANELMGR]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\PanelMgr
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\PanelMgr
COPY_SUBDIR = 1

[COPYFILE_SPANEL_SETLANG]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\Setlang
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\Setlang
COPY_SUBDIR = 1

[COPYFILE_SPANEL_SHARED]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\Shared
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\Shared
COPY_SUBDIR = 1


[COPYFILE_SPANEL_SPANEL]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\SPanel
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\SPanel
COPY_SUBDIR = 0

[COPYFILE_SPANEL_SPANEL_LANG]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\SPanel\Lang
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\SPanel\Lang
COPY_SUBDIR = 1

[COPYFILE_SPANEL_SPANEL_PSU]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\SPanel\PSU
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\SPanel\PSU
COPY_SUBDIR = 1

[COPYFILE_SPANEL_SPANEL_HELP_FLASH]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\SPanel\Help\Flash_Shockwave_Full.exe
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\SPanel\Help\Flash_Shockwave_Full.exe
COPY_SUBDIR = 0

[COPYFILE_SPANEL_SPANEL_HELP_HELP]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\SPanel\Help\help_$LANG_ABBR$.chm
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\SPanel\Help\help_$LANG_ABBR$.chm
COPY_SUBDIR = 0

[COPYFILE_SPANEL_SPANEL_SWF]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\SPanel\swf
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\SPanel\swf
COPY_SUBDIR = 1

[COPYFILE_SPANEL_SPANEL_RCP]
DESCRIPTION = @COMPONENT.SP@
SOURCE = %SPANEL_DIR%\SPanel\RCP
DESTINATION = $DEST_INST_DIR$\Application\SPANEL\SPanel\RCP
COPY_SUBDIR = 1

[COPYFILE_HTML_GUIDE_COMMON]
DESCRIPTION = @FILE_COPY.MANUAL@
SOURCE = $SRC_DIR$\MANUAL\%MODEL_NAME%\common
DESTINATION = $DEST_INST_DIR$\MANUAL\%MODEL_NAME%\common
COPY_SUBDIR = 1

[COPYFILE_HTML_GUIDE]
DESCRIPTION = @FILE_COPY.MANUAL@
SOURCE = $SRC_DIR$\MANUAL\%MODEL_NAME%\$ORG_LANG_DIR$
DESTINATION = $DEST_INST_DIR$\MANUAL\%MODEL_NAME%\$ORG_LANG_DIR$
COPY_SUBDIR = 1


//////////////////////////////////////////////////
//
// Copy Network Monitor File
//
////////////////////////////////////////////////////
[NET_MON_9X_FILE]
SUPPORTED_OS = WIN95,WIN98,WINME
FILE = $SRC_DIR$\DATA\NetMon\secmon_9x.dll,$SYS_DIR$\secmon.dll
FILE = $SRC_DIR$\DATA\NetMon\ini\$LANG_DIR$\Secmon.ini,$SYS_DIR$\Secmon.ini,0
FILE = $SRC_DIR$\DATA\NetMon\SecSNMP.dll,$SYS_DIR$\SecSNMP.dll,0
[NET_MON_9X_FILE_END]

[NET_MON_NT_FILE]
SUPPORTED_OS = WINNT
FILE = $SRC_DIR$\DATA\NetMon\secmon_NT.dll,$SYS_DIR$\secmon.dll
FILE = $SRC_DIR$\DATA\NetMon\ini\$LANG_DIR$\Secmon.ini,$SYS_DIR$\Secmon.ini,0
FILE = $SRC_DIR$\DATA\NetMon\SecSNMP.dll,$SYS_DIR$\SecSNMP.dll,0
[NET_MON_NT_FILE_END]

////////////////////////////////////////////////
//
// Shortcut information
//
///////////////////////////////////////////////
[PRT_SOLUTION_SHORTCUT]
NAME = @PRT_SOLUTION.NAME@
GROUP = START
TARGET = @PRT_SOLUTION.URL@
ARGUMENT = 
ICON_FILE = $DEST_INST_DIR$\DATA\SyncThru.ico
ICON_INDEX = 0
PERMISSION = 
FOLDER_NAME = @UNINST_SHORTCUT.FOLDER_NAME@
DESCRIPTION = @PRT_SOLUTION.NAME@

[ANYWEB_PRINT_SHORTCUT]
NAME = @SHORTCUT_ANYWEB_PRINT.DOWNLOAD@
GROUP = START
TARGET = "http://solution.samsungprinter.com/personal/anywebprint" 
ARGUMENT = 
ICON_FILE = $DEST_DIR$\Install\DATA\AnyWeb Print.ico
ICON_INDEX = 0
PERMISSION = 
FOLDER_NAME = Samsung Printers\AnyWeb Print
DESCRIPTION = Samsung AnyWeb Print



[UNINST_SHORTCUT]
NAME = @COMMON.SHORTCUT_MAINT@
GROUP = START
TARGET = $DEST_INST_DIR$\$INSTALLER_EXE$
ARGUMENT = /R
ICON_FILE = $DEST_INST_DIR$\$INSTALLER_EXE$
ICON_INDEX = 0
PERMISSION = 
FOLDER_NAME = @UNINST_SHORTCUT.FOLDER_NAME@
//DESCRIPTION = @UNINST_SHORTCUT.DESC@

[MANUAL_SHORTCUT]
NAME = @WELCOME.MANUAL@
GROUP = START
TARGET = $DEST_INST_DIR$\DATA\Ssopen.exe
ARGUMENT = /T$DEST_INST_DIR$\MANUAL\$ORG_LANG_DIR$\%USER_GUIDE_NAME% /I$DEST_INST_DIR$\@ACROBATREADER_PATH@ /N %MODEL_NAME%
ICON_FILE = $DEST_INST_DIR$\DATA\Ssopen.exe
ICON_INDEX = 0
PERMISSION = 
FOLDER_NAME = @UNINST_SHORTCUT.FOLDER_NAME@
DESCRIPTION = @WELCOME.MANUAL@



[DR_PRINTER_SHORTCUT]
SUPPORTED_LANG = KR, EN, CP, RU, IT, FN, GR
NAME = @DR_PRINTER.NAME@
GROUP = DESKTOP
TARGET = @DR_PRINTER.URL@
ARGUMENT = 
ICON_FILE = $WIN_DIR$\Dr. Printer Icon.ico
ICON_INDEX = 0
PERMISSION = 
FOLDER_NAME = 
DESCRIPTION = 
DELETE = 0


[LANGUAGE_SHORTCUT]
NAME = @COMMON.SHORTCUT_LANG@
GROUP = START
TARGET = $DEST_INST_DIR$\data\SSLang.exe
ARGUMENT = SSLang.dat
ICON_FILE = $DEST_INST_DIR$\data\SSLang.exe
ICON_INDEX = 0
PERMISSION = 
FOLDER_NAME = @UNINST_SHORTCUT.FOLDER_NAME@
DESCRIPTION = @COMMON.SHORTCUT_LANG@


[HTML_GUIDE_SHORTCUT]
NAME = @WELCOME.MANUAL@
GROUP = START
TARGET = $DEST_INST_DIR$\MANUAL\%MODEL_NAME%\$ORG_LANG_DIR$\start_here.htm
ARGUMENT = 
ICON_FILE = $DEST_INST_DIR$\DATA\Html Guide Icon.ico
ICON_INDEX = 0
PERMISSION = 
FOLDER_NAME = @SHORTCUT_MAINT.COMMON_FOLDER_NAME@
DESCRIPTION = @WELCOME.MANUAL@

/////////////////////////////////////////////////////////////////////
//
// section of Registry to be added 
// 
// RootKey = HKLM,HKCU        Default value is HKLM
// KeyName = Created or existing key name
// Value.VALUE = type,name,data 
// - value name is value name
// - value type is registry type (REG_DWORD, REG_SZ)
// - Value is real value, if REG_DWORD and value is 0x???? ==> it is hexadecimal
//                        if REG_DWORD and Value is ????   ==> it is decimal
//                        if REG_SZ, the value must be bound with quotation mark.
/////////////////////////////////////////////////////////////////////////////////

[ADD_REG.UNINSTKEY]
ROOTKEY = HKLM
KEYNAME = Software\Microsoft\Windows\CurrentVersion\uninstall\%MODEL_NAME%
VALUE = REG_SZ,DisplayName,@REGISTRY.UNINSTALL_NAME@
VALUE = REG_SZ,UninstallString,$DEST_INST_DIR$\$INSTALLER_EXE$ /R
VALUE = REG_SZ,DisplayIcon,$DEST_INST_DIR$\$INSTALLER_EXE$
VALUE = REG_SZ,Publisher,Samsung Electronics CO.,LTD
DELETE_KEY = 1
[ADD_REG.UNINSTKEY_END]


[ADD_REG.USER_GUIDE]
ROOTKEY = HKLM
KEYNAME = Software\%MFG%\%MODEL_NAME%\Installed
VALUE = REG_SZ,UserGuideDir,%HTML_GUIDE_DEST_DIR%
VALUE = REG_SZ,UserGuideFile,%HTML_GUIDE_NAME%
DELETE_KEY = 1
[ADD_REG.USER_GUIDE_END]

[ADD_REG.PRINTER119_DELETE_ALL]
ROOTKEY = HKLM
KEYNAME = Software\%MFG%\%MODEL_NAME%\Installed
VALUE = REG_SZ,Uninstall,"$DEST_DIR$\Install\Setup.exe" /D
[ADD_REG.PRINTER119_DELETE_ALL_END]
