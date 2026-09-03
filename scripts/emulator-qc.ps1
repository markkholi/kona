# Kona — Android emulator QC helpers.
# Usage: powershell -File scripts/emulator-qc.ps1 <command> [args]
#
# Commands:
#   env            Print SDK / AVD / device status
#   ensure-avd     Create MatthewsQC_Phone if missing (requires system image)
#   start          Boot the phone AVD if no emulator is running
#   wait           Wait until the emulator has finished booting
#   ready          ensure-avd + start + wait
#   screenshot     Capture PNG into .qc/ (optional name argument)
#   dump-ui        Save uiautomator XML + screenshot into .qc/
#   tap X Y        Tap at pixel coordinates
#   swipe X1 Y1 X2 Y2 [MS]
#   text "hello"   Type text (use %s for spaces)
#   key KEYCODE    e.g. BACK, HOME, ENTER, TAB
#   install [path] Install APK to emulator
#   launch         Start com.mkholi.kona
#   stop           Force stop com.mkholi.kona
#   logcat         Print recent React Native / Android errors

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Command = "env",
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Rest
)

$ErrorActionPreference = "Stop"
$AvdName = "MatthewsQC_Phone"
$PackageId = "com.mkholi.kona"
$SystemImage = "system-images;android-36;google_apis;x86_64"
$DeviceProfile = "pixel_6"
$Sdk = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    "$env:LOCALAPPDATA\Android\Sdk"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $Sdk) {
    throw "Android SDK not found. Install Android Studio, then re-run this script."
}

$env:ANDROID_HOME = $Sdk
$env:ANDROID_SDK_ROOT = $Sdk
$env:Path = "$Sdk\platform-tools;$Sdk\emulator;$Sdk\cmdline-tools\latest\bin;$env:Path"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$QcDir = Join-Path $RepoRoot ".qc"

function Get-EmulatorSerial {
    $lines = adb devices | Select-Object -Skip 1
    foreach ($line in $lines) {
        if ($line -match "^(emulator-\d+)\s+device") { return $Matches[1] }
        if ($line -match "^(emulator-\d+)\s+") { return $Matches[1] }
    }
    return $null
}

function Invoke-Adb {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$AdbArgs)
    $serial = Get-EmulatorSerial
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        if ($serial) {
            & adb -s $serial @AdbArgs
        } else {
            & adb @AdbArgs
        }
        if ($LASTEXITCODE -ne 0) {
            throw "adb $($AdbArgs -join ' ') failed with exit code $LASTEXITCODE"
        }
    } finally {
        $ErrorActionPreference = $prev
    }
}

function Ensure-QcDir {
    if (-not (Test-Path $QcDir)) {
        New-Item -ItemType Directory -Path $QcDir | Out-Null
    }
}

function Get-AvdNames {
    emulator -list-avds 2>$null
}

function Ensure-Avd {
    $existing = @(Get-AvdNames)
    if ($existing -contains $AvdName) {
        Write-Output "AVD $AvdName already exists."
        return
    }

    $imagePath = Join-Path $Sdk ($SystemImage -replace ";", [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path $imagePath)) {
        throw "Missing system image $SystemImage. Install it with:`n  sdkmanager `"$SystemImage`""
    }

    Write-Output "Creating AVD $AvdName ($DeviceProfile, $SystemImage)..."
    "no" | avdmanager create avd -n $AvdName -k $SystemImage -d $DeviceProfile --force
    $config = Join-Path $env:USERPROFILE ".android\avd\$AvdName.avd\config.ini"
    if (Test-Path $config) {
        Add-Content -Path $config -Value @"
hw.keyboard=yes
hw.ramSize=3072
disk.dataPartition.size=8G
"@
    }
    Write-Output "Created $AvdName."
}

function Start-QcEmulator {
    $serial = Get-EmulatorSerial
    if ($serial) {
        Write-Output "Emulator already running: $serial"
        return
    }

    Ensure-Avd
    $emulatorExe = Join-Path $Sdk "emulator\emulator.exe"
    Write-Output "Starting $AvdName..."
    Start-Process -FilePath $emulatorExe -ArgumentList @(
        "-avd", $AvdName,
        "-netdelay", "none",
        "-netspeed", "full",
        "-gpu", "auto",
        "-no-snapshot-save"
    ) -WindowStyle Normal
}

function Wait-QcBoot {
    Write-Output "Waiting for emulator device..."
    $deadline = (Get-Date).AddMinutes(6)
    do {
        $stateLine = adb devices | Select-String "emulator-"
        if ($stateLine -match "device$") { break }
        if ((Get-Date) -gt $deadline) { throw "Timed out waiting for emulator to appear in adb." }
        Start-Sleep -Seconds 3
    } while ($true)

    Write-Output "Waiting for boot to finish..."
    do {
        try {
            $boot = (Invoke-Adb shell getprop sys.boot_completed 2>$null | Out-String).Trim()
        } catch {
            $boot = ""
        }
        if ($boot -eq "1") { break }
        if ((Get-Date) -gt $deadline) { throw "Timed out waiting for sys.boot_completed." }
        Start-Sleep -Seconds 3
    } while ($true)

    Invoke-Adb shell settings put global window_animation_scale 0 | Out-Null
    Invoke-Adb shell settings put global transition_animation_scale 0 | Out-Null
    Invoke-Adb shell settings put global animator_duration_scale 0 | Out-Null
    Write-Output "Emulator is ready: $(Get-EmulatorSerial)"
}

function Save-Screenshot {
    param([string]$Name = "screen")
    Ensure-QcDir
    $safe = ($Name -replace "[^A-Za-z0-9._-]", "_")
    $path = Join-Path $QcDir "$safe.png"
    Invoke-Adb shell screencap /sdcard/qc-screen.png | Out-Null
    $pull = Invoke-Adb pull /sdcard/qc-screen.png $path 2>&1 | Out-String
    if (-not (Test-Path $path)) {
        throw "Screenshot pull failed: $pull"
    }
    Write-Output $path
}

function Save-UiDump {
    param([string]$Name = "ui")
    Ensure-QcDir
    $safe = ($Name -replace "[^A-Za-z0-9._-]", "_")
    Invoke-Adb shell uiautomator dump /sdcard/window_dump.xml | Out-Null
    $xmlPath = Join-Path $QcDir "$safe.xml"
    Invoke-Adb pull /sdcard/window_dump.xml $xmlPath | Out-Null
    $shot = Save-Screenshot $safe
    Write-Output "UI dump: $xmlPath"
    Write-Output "Screenshot: $shot"
}

function Show-Env {
    Write-Output "ANDROID_HOME=$Sdk"
    Write-Output "AVD target=$AvdName"
    Write-Output "Package=$PackageId"
    Write-Output "--- AVDs ---"
    $avds = @(Get-AvdNames)
    if ($avds.Count -eq 0) { Write-Output "(none)" } else { $avds | ForEach-Object { Write-Output $_ } }
    Write-Output "--- adb devices ---"
    adb devices -l
    $imagePath = Join-Path $Sdk ($SystemImage -replace ";", [IO.Path]::DirectorySeparatorChar)
    Write-Output "System image present: $(Test-Path $imagePath)"
}

switch ($Command.ToLowerInvariant()) {
    "env" { Show-Env }
    "ensure-avd" { Ensure-Avd }
    "start" { Start-QcEmulator }
    "ready" {
        Start-QcEmulator
        Wait-QcBoot
    }
    "wait" { Wait-QcBoot }
    "screenshot" { Save-Screenshot $(if (@($Rest).Count -gt 0 -and $Rest[0]) { $Rest[0] } else { "screen" }) }
    "dump-ui" { Save-UiDump $(if (@($Rest).Count -gt 0 -and $Rest[0]) { $Rest[0] } else { "ui" }) }
    "tap" {
        if (@($Rest).Count -lt 2) { throw "tap requires X Y" }
        Invoke-Adb shell input tap $Rest[0] $Rest[1]
    }
    "swipe" {
        if (@($Rest).Count -lt 4) { throw "swipe requires X1 Y1 X2 Y2 [MS]" }
        $ms = if (@($Rest).Count -ge 5) { $Rest[4] } else { "300" }
        Invoke-Adb shell input swipe $Rest[0] $Rest[1] $Rest[2] $Rest[3] $ms
    }
    "text" {
        if (@($Rest).Count -lt 1) { throw "text requires a string" }
        $encoded = ($Rest -join " ") -replace " ", "%s"
        Invoke-Adb shell input text $encoded
    }
    "key" {
        if (@($Rest).Count -lt 1) { throw "key requires a KEYCODE" }
        Invoke-Adb shell input keyevent $Rest[0]
    }
    "install" {
        $apkPath = if (@($Rest).Count -gt 0 -and $Rest[0]) { $Rest[0] } else {
            $found = Get-ChildItem -Path $RepoRoot -Recurse -Filter "*.apk" | Select-Object -First 1
            if ($found) { $found.FullName } else { throw "No APK file found in $RepoRoot. Specify APK path to install." }
        }
        Write-Output "Installing $apkPath..."
        Invoke-Adb install -r $apkPath
    }
    "launch" {
        Invoke-Adb shell am start -n "$PackageId/.MainActivity"
    }
    "stop" {
        Invoke-Adb shell am force-stop $PackageId
    }
    "logcat" {
        Invoke-Adb logcat -d -t 80 "*:E" "ReactNative:V" "ReactNativeJS:V" "Expo:V"
    }
    default { throw "Unknown command '$Command'. Run without args for env, or see script header." }
}
