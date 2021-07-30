let fs = require('fs')

Plugin.registerCompiler({
  extensions: ["ts", "tsx"],
}, function () {
  return new TypeScriptCompiler({
    react: true,
    typescript: true,
  }, (babelOptions, file) => {
    if (file.hmrAvailable() && ReactFastRefresh.babelPlugin) {
      babelOptions.plugins = babelOptions.plugins || [];
      babelOptions.plugins.push(ReactFastRefresh.babelPlugin);
    }
  });
});


class TypeScriptCompiler extends BabelCompiler {
  processFilesForTarget(inputFiles) {
    return super.processFilesForTarget(inputFiles
      .map(file => { //This map is my attempt at copying the d.ts files. Everything else is unchanged
        if (file.getPathInPackage().endsWith(".d.ts") && !file.getPathInPackage().startsWith("node_modules")) {
          const pathInPackage = file.getPathInPackage()
          const pathBits = pathInPackage.split('/')
          const fileName = pathBits[pathBits.length - 1] // there should probably be a better way to get the file name !?
          const packageName = file.getPackageName()
          const sourcePath = file._resourceSlot.packageSourceBatch.sourceRoot + '/' + pathInPackage
          const destinationPath = file._resourceSlot.packageSourceBatch.processor.sourceRoot + '/node_modules/meteor/' + packageName + '/' + fileName
          console.log(sourcePath + ' -> ' + destinationPath )
          //  /Users/jan-michaelpilgenroeder/Code/meteor-packages/sdui-table/imports/ui/MeteorDataAutoTable.d.ts -> /Users/jan-michaelpilgenroeder/Code/sdui-dev/node_modules/meteor/janmp:sdui-table/MeteorDataAutoTable.d.ts
          //  /Users/jan-michaelpilgenroeder/Code/meteor-packages/sdui-table/imports/ui/MeteorDataAutoTable.d.ts -> /Users/jan-michaelpilgenroeder/Code/sdui-dev/node_modules/meteor/janmp:sdui-table/MeteorDataAutoTable.d.ts
          
          // the paths look good for my local packages (this should probably fail on windows though and I have not tried this with atmosphere packages)
          // the idea was to use fs.copyFile now, but I can't get it imported or required
        }
        return file;
      })
      .filter(
      // TypeScript .d.ts declaration files look like .ts files, but it's
      // important that we do not compile them using the TypeScript
      // compiler, as it will fail with a cryptic error message.
      file => ! file.getPathInPackage().endsWith(".d.ts")
    ));
  }
}