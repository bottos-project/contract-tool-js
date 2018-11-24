#!/usr/bin/env node 
const program = require('commander');
const download = require('download-git-repo');
const ora = require('ora');
const spinner = ora('start create a Javascript contract project')

program.version('1.0.0', '-v, --version')
       .command('init <name>')
       .action((name) => {
          spinner.start()
          let projectName = name || 'test/tmp'
          download('direct:https://github.com/bottos-project/contract-tool-js.git', projectName, {clone: true}, (err) => {
              if(err){
                spinner.fail('create project failed')
              }else{
                spinner.succeed('create project success')
              }
          })
       });
program.parse(process.argv);