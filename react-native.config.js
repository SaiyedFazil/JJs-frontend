/**
 * Links the Design System v1.0 typefaces (PDF section 02) into the native
 * projects: Bricolage Grotesque for display sizes, Plus Jakarta Sans for text.
 *
 * Run `npm run fonts:link` after adding or removing a file in
 * src/assets/fonts. Android resolves a face by filename and iOS by PostScript
 * name; both are identical for every bundled file, so `fontFamily` strings
 * such as 'PlusJakartaSans-SemiBold' work unchanged on both platforms.
 */
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts'],
};
