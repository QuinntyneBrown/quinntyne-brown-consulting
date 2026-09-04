/**
 * The markdown editor's background worker. It exists so the application bundler owns and emits the
 * worker as one of its own chunks, rather than leaving the editor to resolve it at runtime from a
 * path that is never published.
 */
import 'monaco-editor/editor/editor.worker';
