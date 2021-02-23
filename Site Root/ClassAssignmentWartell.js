/**
 * \author Zachary Wartell
 * \copyright Copyright 2015. Zachary Wartell.
 * \license Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
 - http://creativecommons.org/licenses/by-nc-sa/4.0/

 \status [STATUS=not deployed] work-in-progress
 */


/**
 Misc. Global variables
 */
var Global =
    {
        /**
         * @brief directory for student being graded
         * @type {string}
         */
        studentDirectory : "",
        /**
         * \todo make this configuration by application
         */
        visualStudio : "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\Common7\\IDE\\devenv.exe"
    };

/*
 * @type {Readonly<{READ: symbol, TODO: symbol, OVERVIEW: symbol, GENERAL: symbol, QUESTION: symbol}>}
 */
const Category = Object.freeze({
    QUESTION: Symbol("Question"),
    GENERAL: Symbol("General"),
    READ: Symbol("Read"),
    TODO: Symbol("Todo"),
    OVERVIEW: Symbol("Overview")
});

function getCategoryFromClass(element, returnNull) {
    if (element.className.includes("Instruction_Question"))
        return Category.QUESTION;
    if (element.className.includes("Instruction_Read"))
        return Category.READ;
    if (element.className.includes("Instruction_Todo"))
        return Category.TODO;
    if (element.className.includes("Instruction_Overview"))
        return Category.OVERVIEW;
    if (element.className.includes("Instruction_General"))
        return Category.GENERAL;
    if (returnNull)
        return null;
    else
        return Category.GENERAL;
}



class OptionSet
{
    constructor(n)
    {
        this.name = n;
        this.options = [];
    }
}

/*class Category
    {
        constructor(e)
        {
            this.value=e;
        }
        static QUESTION = 0;
        static GENERAL = 1;
        static READ = 2;
           static TODO = 3;
    };*/
class Instruction {
    constructor(s, n, sh, c) {
        this.section = s;
        this.number = n;
        this.short = sh;
        this.category = c;
        this.id = "Section_"+(s + "_Item_" + n).replace(/\./g,'_');
        this.points = 0;
        this.comment="";
    }
}

class Instructions
{
    constructor()
    {
        this.instructions = [];
        this.optionSets = [];
    }

    push(i)
    {
        console.assert (i instanceof Instruction);  // \todo rewrite all in TypeScript
        this.instructions.push(i);
    }
}
var instructions = new Instructions();

function roman_lower (n)
{
    console.assert(n<10);
    const roman = [ 'i','ii','iii','iv','v','vi','vii','viii','ix','x'];
    return roman[n-1];
}
function itemString(L1,L2,L3)
{
    const aCode = "a".charCodeAt(0);
    switch(arguments.length)
    {
        case 1:
            return L1.toString();
        case 2:
            return L1.toString() + "." + String.fromCharCode(aCode+L2-1);
        case 3:
            return L1.toString() + "." + String.fromCharCode(aCode+L2-1) + "." + roman_lower(L3);
    }
}

function itemID(sectionLabel,L1,L2,L3)
{
    let id;
    id = sectionLabel.replace('.','_');
    id += itemString(L1,L2,L3).replace('.','_');
    return id;
}

function collectionInstructions(section, sectionLabel) {
    let l1c = 1, l2c = 1, l3c = 1;

    const temp = "self"+Date.now().toString();
    section.id = temp;
    let olList = section.querySelectorAll(":scope > ol.Instruction");
    //section.id = "";
    if (olList !== null && olList.length !== 0) {
        for (let ol of olList) {
            let li1List = ol.querySelectorAll(":scope > li");
            let category = getCategoryFromClass(ol, false);

            l1c = 1;
            for (let li1 of li1List) {
                let tmp, cat = (tmp = getCategoryFromClass(li1, true)) !== null ? tmp : category;

                instructions.push(new Instruction(sectionLabel, itemString(l1c),
                    li1.innerText.trimStart().slice(0, 10) + " ...", cat));
                li1.id = instructions.instructions [instructions.instructions.length-1].id;
                let ol1 = li1.querySelector(":scope > ol");
                if (ol1 !== null && ol1.length !== 0) {
                    let category1 = getCategoryFromClass(ol1, false);

                    let li2List = ol1.querySelectorAll(":scope > li"); // only children, no nested descendants
                    l2c = 1;
                    for (let li2 of li2List) {
                        let tmp, cat = (tmp = getCategoryFromClass(li2, true)) !== null ? tmp : category1;

                        instructions.instructions.push(new Instruction(sectionLabel, itemString(l1c ,l2c),
                            li2.innerText.trimStart().slice(0, 10) + " ...",  cat));
                        li2.id = instructions.instructions[instructions.instructions.length-1].id;
                        let ol2 = li2.querySelector(":scope > ol");
                        if (ol2 !== null && ol2.length !== 0) {
                            let category2 = getCategoryFromClass(ol2, false);

                            let li3List = ol2.querySelectorAll(":scope > li"); // only children, no nested descendants
                            l3c = 1;
                            for (let li3 of li3List) {
                                let tmp, cat = (tmp = getCategoryFromClass(li3, true)) !== null ? tmp : category2;

                                instructions.instructions.push(new Instruction(sectionLabel, itemString(l1c , l2c ,l3c),
                                    li3.innerText.trimStart().slice(0, 10) + " ...", cat));
                                li3.id = instructions.instructions[instructions.instructions.length-1].id;
                                l3c++;
                            }
                        }
                        l2c++;
                    }
                }
                l1c++;
            }
        }
    }

}

function onLoad() {
    // [STATUS=not deployed] work-in-progress
    {
        Global.studentDirectory = localStorage.getItem('studentDirectory') || "";
    }


    // Note this traversal assumes every <h1>, <h2> etc. is immediately preceded by a <section> element
    let h1List = document.querySelectorAll("section > h1");
    let h1c, h2c, h3c;
    h1c = 1;
    for (let h1 of h1List) {
        console.assert(h1.parentElement.tagName === "SECTION");
        collectionInstructions(h1.parentElement, h1c.toString());
        let parent = h1.parentElement;
        let selfIndex = [].slice.call(parent.children).indexOf(h1) + 1;
        let h2List = parent.querySelectorAll(":nth-child(" + selfIndex + ") ~ section > h2");

        if (h2List !== null && h2List.length !== 0) {
            h2c = 1;
            for (let h2 of h2List) {
                console.assert(h2.parentElement.tagName === "SECTION");
                collectionInstructions(h2.parentElement, h1c.toString() + "." + h2c.toString());
                let parent = h2.parentElement;
                let selfIndex = [].slice.call(parent.children).indexOf(h2) + 1;
                let h3List = parent.querySelectorAll(":nth-child(" + selfIndex + ") ~ section > h3");
                if (h3List !== null && h3List.length !== 0) {
                    h3c = 1;
                    for (let h3 of h3List) {
                        console.assert(h3.parentElement.tagName === "SECTION");
                        collectionInstructions(h3.parentElement, h1c.toString() + "." + h2c.toString() + "." + h3c.toString());
                        h3c++;
                    }

                }
                h2c++;
            }
        }
        if (h1.className !== "nocount")
            h1c++;
    }
    console.log(instructions);
    //console.log("instructions.length:"+instructions.length);

    /*
     * construct <tbody> for <table> (#RubricTable) using instructions array and add
     * various <input> HTML elements to certain <table> columns
     */
    let rubric = document.querySelector("#RubricTable > tbody");
    let prevSection = "";
    const REGEX = /Symbol\(([^)]*)\)/; // for removing Symbol sub-string
    let ri=0;
    for (let instruction of instructions.instructions) {
        let row = document.createElement("tr");
        row.setAttribute("data-ri",ri.toString());
        if (instruction.section === prevSection)
            row.innerHTML =
                `<td class="Empty"></td>
                 <td>${instruction.number}</td>
				 <td>${instruction.category.toString().replace(REGEX, '$1')}</td>
				 <td><a href="#${instruction.id}">${instruction.short}</a></td>
                 <td><input type="checkbox" id="#CB_${instruction.id}" name="scales"></td>
                 <td></td>
                 <td></td>
                 <td><input type="text"></td>`;
        else
            row.innerHTML =
                `<td>${instruction.section}</td>
				 <td>${instruction.number}</td>
				 <td>${instruction.category.toString().replace(REGEX, '$1')}</td>
				 <td><a href="#${instruction.id}">${instruction.short}</a></td>
                 <td><input type="checkbox" id="#CB_${instruction.id}" name="scales"></td>
                 <td></td>
                 <td></td>
                 <td><input type="text"></td>`;
        prevSection = instruction.section;
        row.querySelector('input[type="text"]').addEventListener('input',
            (e) =>
            {
                const itemID=e.srcElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.querySelector('a').getAttribute('href');
                const rowIndex=parseInt(e.srcElement.parentElement.parentElement.getAttribute("data-ri"));
                console.log(itemID.slice(1) + ":" + rowIndex + ":" + e);
                console.log(instructions.instructions[rowIndex]);
                instructions.instructions[rowIndex].comment = e.srcElement.valueOf().value;
            });
        rubric.append(row);
        ri++;
    }

    /*
     *  serialize DOM created Rubric table to .xml
     */
    {
        let XMLS = new XMLSerializer();
        let rubricTable_xmls = XMLS.serializeToString(document.querySelector("#RubricTable"));
        let url = URL.createObjectURL(new Blob([rubricTable_xmls], {type: 'application/xml; charset=UTF-16'}));

        // create button to open new browser tab with .xml file
        document.querySelector("#CreateGradingRubricXML").onclick = () => {
            window.open(url);
        };

        // create button to download .xml file
        const link = document.createElement('a');
        link.href = url;
        link.innerText = "Download XML";
        link.download = "Rubric.xml";
        //link.textContent =  "xmlfile.xml";
        //document.querySelector("#RubricButton").onclick = () => {location.href='"' + url + '"';};
        document.querySelector("#RubricDownloadXML").append(link);
    }

    /*
     *  serialize DOM created Rubric table to .json
     */
    {
        let rubricTable_json = JSON.stringify(instructions);
        let url = URL.createObjectURL(new Blob([rubricTable_json], {type: 'text/plain; charset=UTF-16'}));

        // create button to open new browser tab with .json file
        document.querySelector("#CreateGradingRubricJSON").onclick = () => {
            window.open(url);
        };

        // create button to download .json file
        const link = document.createElement('a');
        link.href = url;
        link.innerText = "Download JSON";
        link.download = "Rubric.json";
        document.querySelector("#RubricDownloadJSON").append(link);
    }

    // create <input> element to select studentDirectory
    document.querySelector("#StudentDirectory").addEventListener('change',
        (e) =>
        {
            console.log(e);
            Global.studentDirectory = e.target.value;//files[0].match(/(.*)[\/\\]/)[1] || '';
            localStorage.setItem('studentDirectory', Global.studentDirectory);
            console.log(Global.studentDirectory);
        });

    return;
}

/**
 \brief GradingScript generates and downloads a Bash script from the browser that
 when executed on the client PC automates various parts of the task of grading a particular <section>'s
 set of instructions (ol.Instructions)

 \todo [PRIORITY=LOW] Long term consider replacing bash script with NodeJS to simplify project maintenance
 */
class GradingScript
{
    constructor(...args)
    {
        switch(args.length)
        {
            case 0:
                this.category = "";
                this.projectDirectory = "";
                break;
            case 1:
                this.category = args[0].category;
                this.projectDirectory = args[0].projectDirectory;
                break;
        }
    }

    /**
     \brief Download a Bash script customized to semi-automate grading of the the project
     in sub-directory 'projectDir' of the current 'Global.studentDirectory'
     */
    downloadScript()
    {
        // bash script for automatically grading report and process
        const script=
`#!/bin/bash
DIR=\`cygpath -u "${Global.studentDirectory}"\`/${this.projectDirectory}
CATEGORY=${this.category}
#echo Enter Student Directory:
#read studentDir
#pushd "$studentDir/$DIR"

#
# interactively deal with student mis-named directories, by help grader
# find matching folder names and then proceeding with the matching one
#
if [[ ! -d "$DIR" ]]; then
    echo Directory "$DIR" does not exist, searching parent directories...
    UPPER_DIR=\`dirname $DIR\`
    levels=1
    while [[ "$UPPER_DIR" != "" ]] && [[ ! -d "$UPPER_DIR" ]]; do
        echo Directory '$UPPER_DIR' does not exist, checking parent directory...
        UPPER_DIR=\`dirname $UPPER_DIR\`
        levels = (( levels + 1 ))
    done    
    if [[ "$UPPER_DIR" == "" ]]; then
        echo FATAL ERROR: Could not find any upper level directories in the path.
        exit 1
    fi
    echo Attempting to match:
    echo     '$DIR'
    echo starting with:
    echo     '$UPPER_DIR'
    while [[ ! -d "$UPPER_DIR" ]] && [[ $level -ne 1 ]]; do
        echo Potential directories under '$UPPER_DIR': 
        find "$UPPER_DIR" -maxdepth 1 -type d 
        while [[ ! -d "$UPPER_DIR" ]]; do
            echo -n Enter name of best matching directory name:
            read directoryName
            NEW_UPPER_DIR=$UPPER_DIR/$directoryName
            if [[ ! -d "$NEW_UPPER_DIR" ]]; then
                echo '$NEW_UPPER_DIR' does not exist.  Please try again
            else
                UPPER_DIR=$NEW_UPPER_DIR
            fi
        done
        level = (( level - 1 ))
    done    
fi

#
# collect basic info on project subdirectory and store in report.json file
#
pushd "$DIR" 1>2
REC="report.json"

# find .sln file
echo {                                          > $REC

echo '"category"' : "$CATEGORY",			    >> $REC

if [[ $CATEGORY == "MSVSSolution" ]]; then
    SLN=\`find . -name "*.sln"\`
    echo '"solutionFile"' : "$SLN",			    >> $REC
    
    # open solution file in Visual Studio
    start "${Global.visualStudio}" $SLN
    
    # find all 'user' source code files
    CODE_FILES_CONDITION='-name "*.cs" ! -name "*.AssemblyInfo.cs"'				
    CODE_FILES=\`mktemp codefiles.XXXXX.txt\`
    find . $CODE_FILES_CONDITION > $CODE_FILES
    
    # save file list to report.json 
    echo '"codeFiles"' : [ 						>> $REC
    sed 's/\\(.*\\)/   "\\1",/M' $CODE_FILES    >> $REC
    echo ], 									>> $REC
     
    # perform line of code count and save to report.json
    find . $CODE_FILES_CONDITION -print0 > $CODE_FILES
    #cat $CODE_FILES
    LOC=\`wc -l --files0-from=$CODE_FILES | tail -1l | sed 's/\\([0-9]*\\).*/\\1/'\`
    #echo LOC $LOC
    
    echo '"linesOfCode"' : $LOC,				>> $REC    
fi

# find all 'user' created plain text files				
NON_CODE_FILES_CONDITION='-name ".gitignore" -o -name "*.txt" -o -name "*.md" -a \\( ! -name "*.cs" \\)' 
NON_CODE_FILES=\`mktemp codefiles.XXXXX.txt\`
find . $NON_CODE_FILES_CONDITION > $NON_CODE_FILES

# save file list to report.json 
echo '"nonCodeFiles"' : [ 						>> $REC
sed 's/\\(.*\\)/   "\\1",/M' $NON_CODE_FILES    >> $REC
echo ], 									    >> $REC
 
# perform line of count for non-code text files and save to report.json
find . $NON_CODE_FILES_CONDITION -print0 > $NON_CODE_FILES
#cat $CODE_FILES
LOC=\`wc -l --files0-from=$NON_CODE_FILES | tail -1l | sed 's/\\([0-9]*\\).*/\\1/'\`
#echo LOC $LOC

echo '"linesOfNonCode"' : $LOC,				    >> $REC

echo } 										    >> $REC
#rm $CODE_FILES
popd 1>2

echo Hit Enter to complete
read EnterKey`;
        //console.log("InsertGradeButton:"+studentDirectory);

        switch(this.category)
        {
            case 'Question':
                // \todo What do to here to help automate grading?
                break;
            case 'DirectoryCreation':
                // \todo What do to here to help automate grading?
                break;
            case 'MSVSSolution':
            {
                // encode script into URL object
                let url = URL.createObjectURL(new Blob([script] , {type: 'application/octet-stream; charset=UTF-8'}));

                // create hyperlink to download bash script
                const link = document.createElement('a');
                link.href = url;
                link.innerText = "Run Grade.sh";
                link.download = "Grade.sh";

                // automatically 'click' hyperlink to trigger download
                // \ref https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                break;
            }
        }
    }
}

