const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, from, to) {
  if (!fs.existsSync(filePath)) {
    console.log(`[apply-patches] file not found: ${filePath}`);
    return false;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(from)) {
    console.log('[apply-patches] pattern not found — skipping:', filePath);
    return false;
  }
  const newContent = content.split(from).join(to);
  fs.copyFileSync(filePath, `${filePath}.bak`);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('[apply-patches] patched', filePath);
  return true;
}

(function main(){
  const projectRoot = process.cwd();
  const target = path.join(projectRoot, 'node_modules', 'expo-modules-core', 'android', 'src', 'main', 'java', 'expo', 'modules', 'adapters', 'react', 'permissions', 'PermissionsService.kt');

  const oldSnippet = `// cleanup\n    val askAsyncListener = mAskAsyncListener!!\n    val askAsyncRequestedPermissions = mAskAsyncRequestedPermissions!!\n\n    mAskAsyncListener = null\n    mAskAsyncRequestedPermissions = null\n\n    if (askAsyncRequestedPermissions.isNotEmpty()) {\n      // invoke actual asking for permissions\n      askForManifestPermissions(askAsyncRequestedPermissions, askAsyncListener)\n    } else {\n      // user asked only for Manifest.permission.WRITE_SETTINGS\n      askAsyncListener.onResult(mutableMapOf())\n    }`;

  const newSnippet = `// cleanup\n    val askAsyncListener = mAskAsyncListener\n    val askAsyncRequestedPermissions = mAskAsyncRequestedPermissions\n\n    mAskAsyncListener = null\n    mAskAsyncRequestedPermissions = null\n\n    if (askAsyncRequestedPermissions != null && askAsyncRequestedPermissions.isNotEmpty()) {\n      // invoke actual asking for permissions\n      if (askAsyncListener != null) {\n        askForManifestPermissions(askAsyncRequestedPermissions, askAsyncListener)\n      }\n    } else {\n      // user asked only for Manifest.permission.WRITE_SETTINGS (or listener missing)\n      askAsyncListener?.onResult(mutableMapOf())\n    }`;

  try {
    const ok = replaceInFile(target, oldSnippet, newSnippet);
    if (!ok) {
      // As a fallback, try replacing a slightly different variant (no leading comment)
      const oldVariant = `val askAsyncListener = mAskAsyncListener!!\n    val askAsyncRequestedPermissions = mAskAsyncRequestedPermissions!!\n\n    mAskAsyncListener = null\n    mAskAsyncRequestedPermissions = null\n\n    if (askAsyncRequestedPermissions.isNotEmpty()) {\n      // invoke actual asking for permissions\n      askForManifestPermissions(askAsyncRequestedPermissions, askAsyncListener)\n    } else {\n      // user asked only for Manifest.permission.WRITE_SETTINGS\n      askAsyncListener.onResult(mutableMapOf())\n    }`;
      const ok2 = replaceInFile(target, oldVariant, newSnippet);
      if (!ok2) {
        console.warn('[apply-patches] no matches found to patch. You may need to upgrade expo-modules-core or apply a manual fix.');
        process.exit(0);
      }
    }
  } catch (e) {
    console.error('[apply-patches] error applying patch:', e);
    process.exit(1);
  }
})();
