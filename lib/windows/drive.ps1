Add-Type @"
using System;
using System.Runtime.InteropServices;

public class MediaKey {
  [DllImport("user32.dll")]
  private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

  public static void SendTrack(byte key) {
      keybd_event(key, 0, 0x0001, UIntPtr.Zero);
      keybd_event(key, 0, 0x0001 | 0x0002, UIntPtr.Zero);
  }

  public static void ResolveTrack(string action) {
    Console.WriteLine("SendTrack: " + action);
    switch (action.ToLower()) {
      case "pause_play":
        SendTrack(0xB3);
        break;
      case "next":
        SendTrack(0xB0);
        break;
      case "previous":
        SendTrack(0xB1);
        break;
      case "volume_up":
        SendTrack(0xAF);
        break;
      case "volume_down":
        SendTrack(0xAE);
        break;
    }
  }
}
"@

while (1) {
    $action = Read-Host "waiting"
    [MediaKey]::ResolveTrack($action)
}
