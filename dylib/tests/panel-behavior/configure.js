// Configure uses the existing per-game plugin values in both Steam panel forms.
'use strict';
const { execFileSync } = require('node:child_process');
const { panel, walk, details, runner, FORMS } = require('./harness');

let failed = 0;
const emit = process.argv[2];
const feats = JSON.stringify([
  { k: 'NOTPROTON_ROOT', l: 'Plugin', on: '1', off: '', cfg: 1 },
  { k: 'NOTPROTON_CHILD', l: 'Child toggle', on: '1', off: '', dep: 'NOTPROTON_ROOT' },
  { k: 'NOTPROTON_LEVEL', l: 'Level', ty: 'choice', ch: [{ v: 'hi', l: 'High' }],
    dep: 'NOTPROTON_CHILD' },
  { k: 'NOTPROTON_RANGE', l: 'Range', ty: 'slider', mn: 1, mx: 10, dep: 'NOTPROTON_ROOT' },
  { k: 'NOTPROTON_NOTE', l: 'Note', ty: 'text', dep: 'NOTPROTON_ROOT' },
  { k: 'NOTPROTON_PLAIN', l: 'Plain plugin', on: '1', off: '' },
  { k: 'NOTPROTON_INLINE', l: 'Inline toggle', on: '1', off: '', dep: 'NOTPROTON_PLAIN' },
]).replace(/"(\w+)":/g, '$1:');

for (const form of Object.keys(FORMS)) {
  const t = runner(form);
  const { render, written } = panel(emit, form, undefined, { feats });
  const nodes = options => walk(render({ details: details(options) }));
  const row = (all, label) => all.find(x => x.props?.label === label);
  const dialog = all => all.find(x => x.type === 'dialog');
  const button = all => all.find(x => x.type === 'Button' && x.props.children === 'Configure…');
  const initial = nodes('%command%');
  const options = 'NOTPROTON_ROOT=1 NOTPROTON_CHILD=1 NOTPROTON_PLAIN=1 %command%';
  const active = nodes(options);
  t.ok(!!row(initial, 'Plugin') && !!button(initial), 'the enable toggle and Configure appear independently');
  t.ok(!!dialog(initial) && !!row(walk(dialog(initial)), 'Child toggle'), 'top-level controls can be edited while disabled');
  t.ok(!row(initial, 'Level'), 'nested fields still respect their parent settings');
  t.ok(!!dialog(active) && !!row(walk(dialog(active)), 'Level') && !!row(walk(dialog(active)), 'Range'),
       'choice and slider controls appear inside the dialog');
  t.ok(!!row(active, 'Inline toggle') && active.filter(x => x.type === 'dialog').length === 1,
       'an unmarked plugin keeps its controls inline');
  if (dialog(active) && button(active)) {
    let opens = 0, closes = 0;
    const element = { open: false, showModal() { opens++; this.open = true; },
                      close() { closes++; this.open = false; } };
    dialog(active).props.ref(element);
    button(active).props.onClick();
    walk(dialog(active)).find(x => x.type === 'Button' && x.props.children === 'Done').props.onClick();
    t.ok(opens === 1 && closes === 1, 'Configure opens a modal and Done closes it');
    const choice = walk(dialog(active)).find(x => x.type === 'select' && x.props['aria-label'] === 'Level');
    t.ok(!!choice, 'the dialog choice menu stays inside the modal');
    choice?.props.onChange({ currentTarget: { value: 'hi' } });
    t.ok(written.at(-1).opts.includes('NOTPROTON_LEVEL=hi'), 'dialog writes through the existing launch option editor');
  }
  const text = walk(dialog(active)).find(x => x.type === 'input' && x.props['aria-label'] === 'Note');
  t.ok(!!text && text.props.defaultValue === '', 'a text setting starts empty');
  if (text) {
    const value = "one' $(printf SHOULD_NOT_RUN) ; two";
    let invalid = '';
    const input = { value, setCustomValidity(message) { invalid = message; }, reportValidity() {} };
    text.props.onBlur({ currentTarget: input });
    const saved = written.at(-1).opts;
    const output = execFileSync('/bin/sh', ['-c', saved.replace('%command%', 'sh -c \'printf %s "$NOTPROTON_NOTE"\'')],
                                { encoding: 'utf8' });
    t.ok(output === value && !invalid, 'a text field round-trips literal shell metacharacters');
    t.ok(walk(dialog(nodes(saved))).find(x => x.type === 'input')?.props.defaultValue === value,
         'saved text is loaded when the dialog renders again');
    input.value = '%CoMmAnD%';
    const count = written.length;
    text.props.onBlur({ currentTarget: input });
    t.ok(!!invalid && written.length === count, 'the Steam command placeholder cannot be saved as text');
    const savedText = walk(dialog(nodes(saved))).find(x => x.type === 'input');
    input.value = '';
    savedText.props.onBlur({ currentTarget: input });
    t.ok(!written.at(-1).opts.includes('NOTPROTON_NOTE='), 'clearing the text removes only its assignment');
  }
  failed += t.failed;
}
process.exit(failed ? 1 : 0);
