# Launcher graphics plugin

Add a sibling injected plugin, not game-specific fixes. Its single per-game dropdown is disabled without Compatibility's Launch Executable. Automatic (empty value) follows the session backend with no routing override. Choices reuse the selected runner's Graphics choices, excluding D3DMetal on FEX.

Core exposes `context = launch_executable` and `type = graphics_backend` in plugin descriptors. The launch-executable wrapper exports `NOTPROTON_LAUNCH_EXECUTABLE`; legacy wrappers remain readable. Core forwards context to Wine and refuses context-dependent injection without it. Typed settings remain per game and are absent from default-settings controls.

Batch targets are disabled because a script is not a process image.

The plugin resolves the configured Unix executable path to a Wine image identity, matches the current process exactly, and changes process-local DLL search paths only. Rosetta intercepts the compatibility module's backend lookup early; FEX uses existing npload injection and prepend_dll_path before graphics imports. It leaves the requested session backend untouched. Invalid/unsupported settings fail closed. Do not install into the user's live runtime or prefix during development.

Alternatives considered: all routing in core (unnecessary coupling); independent executable configuration in plugin (duplicates existing setting). Selected: generic core context/choice support plus sibling plugin, as requested.
