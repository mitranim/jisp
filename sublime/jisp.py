import sublime
import sublime_plugin

# Similar to using the `insert_snippet` command to wrap selection with
# delimiters. Unlike the `insert_snippet` command, this does not indent
# the selection.
class jisp_wrap(sublime_plugin.TextCommand):
    def run(self, edit, prefix = '', suffix = ''):
        if not prefix and not suffix:
            return

        view = self.view
        sel = view.sel()

        for reg in reversed(sel):
            view.replace(edit, sublime.Region(reg.end(), reg.end()), suffix)
            view.replace(edit, sublime.Region(reg.begin(), reg.begin()), prefix)
