REM \author Zachary Wartell
REM
REM

echo off
if not defined DROPBOX_UNC_CHARLOTTE (
    echo FATAL ERROR: Environment Variables DROPBOX_UNCC_CHARLOTTE is undefined.
    SET /P ENTER="Hit Enter to terminate"
    exit 0
)

echo Copying to Dropbox...
robocopy "%CD%" "%DROPBOX_UNC_CHARLOTTE%\UNCC webpage\public_html\Teaching\ITCS_x120_HTML-CSS-Event_Tutorial" /mir /xf "*.bak" /xd "node_modules"

SET /P ENTER="Hit Enter to complete"
exit 0

REM below not working yet.

%WSSCP%="C:\Program Files (x86)\WinSCP\winscp.com"
%WSSCP% /?
if %ERRORLEVEL% NEQ 0 (
    echo FATAL ERROR: wsscp.com is not installed or not available through the PATH variable
    SET /P ENTER="Hit Enter to terminate"
    exit 0
)

REM below fails, but works directly on command-line
( echo help )| %WSSCP%

REM below fails as well
(
echo open sftp://zwartell@webpages.uncc.edu
echo synchronize remote "%DROPBOX_UNC_CHARLOTTE%\UNCC webpage\public_html\Teaching\ITCS_x120_HTML-CSS-Event_Tutorial" "/public_html/Teaching/ITCS_x120_HTML-CSS-Event_Tutorial"
)| %WSSCP%

if %ERRORLEVEL% NEQ 0 (
    echo FATAL ERROR: wsscp.exe error: %ERRORLEVEL% 
    SET /P ENTER="Hit Enter to terminate"
    exit 0
)
