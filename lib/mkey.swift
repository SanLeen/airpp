// A small tool for sending multimedia-key events
// @author: https://github.com/lihaoyun6
// @date: 2021.7.10
// @build: xcrun swiftc -v -o mkey mkey.swift
// @reference: https://stackoverflow.com/questions/11045814/emulate-media-key-press-on-mac

import Cocoa

let keyList = ["volume_up","volume_down","pause_play","next","previous","fast","rewind"]
var codeList: [String : UInt32] = [
	"volume_up" : 0,
	"volume_down" : 1,
	"pause_play" : 16,
	"next" : 17,
	"previous" : 18,
	"fast" : 19,
	"rewind" : 20
]
func HIDPostAuxKey(key: UInt32) {
	func doKey(down: Bool) {
		let flags = NSEvent.ModifierFlags(rawValue: (down ? 0xa00 : 0xb00))
		let data1 = Int((key<<16) | (down ? 0xa00 : 0xb00))

		let ev = NSEvent.otherEvent(with: NSEvent.EventType.systemDefined,
									location: NSPoint(x:0,y:0),
									modifierFlags: flags,
									timestamp: 0,
									windowNumber: 0,
									context: nil,
									subtype: 8,
									data1: data1,
									data2: -1
									)
		let cev = ev?.cgEvent
		cev?.post(tap: CGEventTapLocation.cghidEventTap)
	}
	doKey(down: true)
	doKey(down: false)
}
if CommandLine.arguments.count < 2{
	print("error: too few parameters\nusage: mkey [key]\nkeys: volume_up, volume_down, pause_play, next, previous, fast, rewind")
	exit(1)
}
if keyList.contains(CommandLine.arguments[1]) {
	HIDPostAuxKey(key:codeList[CommandLine.arguments[1]]!)
	print("The \""+CommandLine.arguments[1]+"\" key is pressed.")
}else{
	print("error: unknow key -- "+CommandLine.arguments[1]+"\nusage: mkey [key]\nkeys: volume_up, volume_down, pause_play, next, previous, fast, rewind")
	exit(1)
}
