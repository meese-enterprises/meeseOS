/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2020, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

//
// This is the client bootstrapping script.
// This is where you can register service providers or set up
// your libraries etc.
//
// https://manual.os-js.org/v3/guide/provider/
// https://manual.os-js.org/v3/install/
// https://manual.os-js.org/v3/resource/official/
//

import {
	Core,
	CoreServiceProvider,
	DesktopServiceProvider,
	VFSServiceProvider,
	NotificationServiceProvider,
	SettingsServiceProvider,
	AuthServiceProvider,
} from "@aaronmeese.com/client";

import { PanelServiceProvider } from "@aaronmeese.com/panels";
import { GUIServiceProvider } from "@aaronmeese.com/gui";
import { DialogServiceProvider } from "@aaronmeese.com/dialogs";
import { WidgetServiceProvider } from "@aaronmeese.com/widgets";
import config from "./config.js";
import "./index.scss";

const init = () => {
	const meeseOS = new Core(config, {});

	// Register your service providers
	meeseOS.register(CoreServiceProvider);
	meeseOS.register(DesktopServiceProvider);
	meeseOS.register(VFSServiceProvider);
	meeseOS.register(NotificationServiceProvider);
	meeseOS.register(SettingsServiceProvider, { before: true });
	meeseOS.register(AuthServiceProvider, { before: true });
	meeseOS.register(PanelServiceProvider);
	meeseOS.register(DialogServiceProvider);
	meeseOS.register(GUIServiceProvider);
	meeseOS.register(WidgetServiceProvider);

	meeseOS.boot();
};

window.addEventListener("DOMContentLoaded", () => init());
