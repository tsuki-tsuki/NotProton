# Launch context for injected plugins

A descriptor can use `context = launch_executable` to require Compatibility's Launch Executable setting, and `type = graphics_backend` to reuse the selected runner's Graphics dropdown. The empty value is Automatic and disables injection. These rows are per game and do not appear in Default Compatibility Settings. Backend rows with launch context are disabled for batch scripts because those have no separate process image.

The generated launch wrapper exports `NOTPROTON_LAUNCH_EXECUTABLE` as the exact Unix path selected by the user, only for `waitforexitandrun`. Existing wrappers remain readable and are upgraded when a setting is saved. Removing the override removes the wrapper and its context export.

The run script forwards this context into Wine. Active injected graphics-backend rows also receive their validated setting under the descriptor's own key. Unsupported backend values (including D3DMetal on FEX), missing context, and Automatic do not load the plugin. Plugins must still match the current process themselves: the context is intentionally inherited so each process can decide whether it applies.

This API selects no backend itself. The separate launcher-graphics plugin implements routing through existing Rosetta injection and plugin-pt3's FEX npload path.
