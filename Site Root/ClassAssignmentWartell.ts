/**
 * \author Zachary Wartell
 * \copyright Copyright 2015. Zachary Wartell.
 * \license Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
 - http://creativecommons.org/licenses/by-nc-sa/4.0/
 */

//export { class_onLoad };

/**
 Misc. Global variables
 */
/**
 * @brief directory for student being graded
 * @type {string}
 */
var studentDirectory : string;
/**
 * \todo make this configuration by application
 */
const visualStudio : string = "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\Common7\\IDE\\devenv.exe"

/*
 * @type {Readonly<{READ: symbol, TODO: symbol, OVERVIEW: symbol, GENERAL: symbol, QUESTION: symbol}>}
 */
enum Category
{
    QUESTION,
    GENERAL,
    READ,
    TODO,
    OVERVIEW,
    SECTION,
    NON_RUBRIC,
    GIT_COMMIT
}
/*
const Category = Object.freeze({
    QUESTION: Symbol("Question"),
    GENERAL: Symbol("General"),
    READ: Symbol("Read"),
    TODO: Symbol("Todo"),
    OVERVIEW: Symbol("Overview"),
    NON_RUBRIC: Symbol("NON_RUBRIC")
});
 */

function getCategoryFromClass(element : HTMLElement, returnNull : boolean) : Category | null{
    if (element.className.includes("Instruction_Question"))
        return Category.QUESTION;
    if (element.className.includes("Instruction_Read"))
        return Category.READ;
    if (element.className.includes("Instruction_Todo"))
        return Category.TODO;
    if (element.className.includes("Instruction_Overview"))
        return Category.OVERVIEW;
    if (element.className.includes("Instruction_Non_Rubric"))
        return Category.NON_RUBRIC;
    if (element.className.includes("Instruction_General"))
        return Category.GENERAL;
    if (element.className.includes("Instruction_Section"))
        return Category.SECTION;
    if (element.className.includes("Instruction_Git_Commit"))
        return Category.GIT_COMMIT;
    if (returnNull)
        return null;
    else
        return Category.GENERAL;
}



class OptionSet
{
    name : string;
    options : string[];  // not sure what type I intended in original JS
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
    section : string;
    number : string;
    short : string;
    id : string;
    pointFraction : number;   // percentage of parent instruction's total points that this instruction item is worth
    points : number;   // points assigned to this instruction item
    comment : string;
    category : Category;
    subSteps : Array<Instruction>;
    parent: Instruction;


    constructor(s : string, n : string, sh : string, c : Category, pf : number = 0, parent : Instruction = null) {
        this.section = s;
        this.number = n;
        this.short = sh;
        this.category = c;
        this.id = "Section_"+(s + "_Item_" + n).replace(/\./g,'_');
        this.points = 0;
        this.pointFraction = pf;
        this.comment="";
        this.parent = parent;
        this.subSteps = new Array<Instruction>();
        if (this.parent !== null)
            this.parent.subSteps.push(this);
    }

    static replacer(key : any , value : any)
    {
        if (key === 'parent')
            return instructions.instructions.indexOf(value);
        if (key === 'subSteps')
        {
            const subSets : Array<number> = new Array<number>;
            for (let s of value)
                subSets.push(instructions.instructions.indexOf(s));
            return subSets;
        }
        return value;
    }

}

class Instructions
{
    instructions :  Instruction[];
    optionSets : OptionSet[];

    constructor()
    {
        this.instructions = [];
        this.optionSets = [];
    }

    push(i : Instruction)
    {
        this.instructions.push(i);
    }

}
var instructions = new Instructions();

function roman_lower (n : number)
{
    console.assert(n<10);
    const roman = [ 'i','ii','iii','iv','v','vi','vii','viii','ix','x'];
    return roman[n-1];
}
function itemString(L1 : number,L2? : number,L3? : number) : string
{
    const aCode = "a".charCodeAt(0);
    let ret : string;
    ret = L1.toString();
    if (L2 !== undefined) ret += "." + String.fromCharCode(aCode+L2-1);
    if (L3 !== undefined) ret += "." + roman_lower(L3);
    return ret;
}

function itemID(sectionLabel : string,L1 : number,L2 : number,L3 : number) : string
{
    let id;
    id = sectionLabel.replace('.','_');
    id += itemString(L1,L2,L3).replace('.','_');
    return id;
}

function collectionInstructions(section : HTMLElement, sectionLabel : string, parent : Instruction) {
    let l1c = 1, l2c = 1, l3c = 1;

    const h : HTMLElement = section.querySelector(":scope > h1, :scope > h2, :scope > h3");
    instructions.push(new Instruction(sectionLabel, "",
        h.innerText.trimStart().slice(0, 10) + " ...", Category.SECTION, section.dataset.pointFraction !== undefined ? parseInt(section.dataset.pointFraction) : 0 ,parent));
    const parent0 = instructions.instructions [ instructions.instructions.length-1];
    section.id = instructions.instructions [instructions.instructions.length-1].id;

    const nInstructions = instructions.instructions.length;

    const temp : string = "self"+Date.now().toString();
    section.id = temp;
    let olList =  section.querySelectorAll(":scope > ol.Instruction, :scope > ul.Instruction");
    //section.id = "";
    if (olList !== null && olList.length !== 0) {
        for (let ol of olList) {
            let li1List = ol.querySelectorAll(":scope > li");
            let category = getCategoryFromClass(<HTMLElement>ol, false);

            l1c = 1;
            const equalFraction1 : number = 1.0 / li1List.length * 100;
            for (let li1_ of li1List) {
                let  li1 : HTMLElement = <HTMLElement>li1_;
                let tmp, cat = (tmp = getCategoryFromClass(li1, true)) !== null ? tmp : category;

                if (tmp === Category.NON_RUBRIC)
                    continue;
                instructions.push(new Instruction(sectionLabel, itemString(l1c),
                    li1.innerText.trimStart().slice(0, 10) + " ...", cat, li1.dataset.pointFraction !== undefined ? parseInt(li1.dataset.pointFraction) : equalFraction1,parent0));
                const parent1 = instructions.instructions [ instructions.instructions.length-1];
                li1.id = instructions.instructions [instructions.instructions.length-1].id;
                let ol1 : HTMLElement = li1.querySelector(":scope > ol");
                if (ol1 !== null) { //&& ol1.length !== 0) {
                    let category1 = getCategoryFromClass(ol1, false);

                    let li2List = ol1.querySelectorAll(":scope > li"); // only children, no nested descendants
                    l2c = 1;
                    const equalFraction2 : number = 1.0 / li2List.length * 100;
                    for (let li2_ of li2List) {
                        const li2 : HTMLElement = <HTMLElement> li2_;
                        let tmp, cat = (tmp = getCategoryFromClass(li2, true)) !== null ? tmp : category1;

                        instructions.instructions.push(new Instruction(sectionLabel, itemString(l1c ,l2c),
                            li2.innerText.trimStart().slice(0, 10) + " ...",  cat, li2.dataset.pointFraction !== undefined ? parseInt(li2.dataset.pointFraction) : equalFraction2 ),parent1);
                        const parent2 = instructions.instructions [ instructions.instructions.length-1];
                        li2.id = instructions.instructions[instructions.instructions.length-1].id;
                        let ol2 : HTMLOListElement = <HTMLOListElement> li2.querySelector(":scope > ol");
                        if (ol2 !== null){// && ol2.length !== 0) {
                            let category2 = getCategoryFromClass(ol2, false);

                            let li3List = ol2.querySelectorAll(":scope > li"); // only children, no nested descendants
                            l3c = 1;
                            const equalFraction3 : number = 1.0 / li3List.length * 100;
                            for (let li3_ of li3List) {
                                const li3 : HTMLOListElement = <HTMLOListElement> li3_;
                                let tmp, cat = (tmp = getCategoryFromClass(li3, true)) !== null ? tmp : category2;

                                instructions.instructions.push(new Instruction(sectionLabel, itemString(l1c , l2c ,l3c),
                                    li3.innerText.trimStart().slice(0, 10) + " ...", cat, li3.dataset.pointFraction !== undefined ? parseInt(li3.dataset.pointFraction) : equalFraction3 ),parent2);
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

    // remove section if it contains no <ol class=Instruction>
    if (nInstructions === instructions.instructions.length)
        instructions.instructions.pop();
}

export function class_onLoad() {
    // [STATUS=not deployed] work-in-progress
    {
        studentDirectory = localStorage.getItem('studentDirectory') || "";
    }

    /*
     *   Compute total TimeToRead for upper levels sections based on TimeToRead in lower level sections
     */
    if (false) {
        let totalTTRs = document.querySelectorAll("td.Time_To_Read_Total");
        for (let tttr_ of totalTTRs) {
            const tttr : HTMLTableCellElement = <HTMLTableCellElement> tttr_;
            const sum = computeTimeToRead(<HTMLHeadElement>tttr.parentElement.parentElement.parentElement.nextElementSibling);
            const span : HTMLSpanElement = <HTMLSpanElement> tttr.querySelector(":scope > span")
            console.assert(span != null);
            span.innerText = sum.toString();
        }
    }

    /**
     *   find all instruction class <li> elements in instruction sections in order to automatically generate Rubric section
     */
    // Note this traversal assumes every <h1>, <h2> etc. is immediately preceded by a <section> element
    let h1List = document.querySelectorAll("section > h1");
    let h1c, h2c, h3c;   // 'headingCountX' ....
    h1c = 1;
    for (let h1 of h1List) {
        console.assert(h1.parentElement.tagName === "SECTION");

        const h1InstructionCount = instructions.instructions.length;
        collectionInstructions(h1.parentElement, h1c.toString(),null);
        const h1NoInstructions : boolean = h1InstructionCount === instructions.instructions.length;
        let parent : HTMLElement = h1.parentElement;

        let selfIndex = [].slice.call(parent.children).indexOf(h1) + 1;   // index of <h1> element, 'h1', within it's parent HTML element
        let h2List = parent.querySelectorAll(":nth-child(" + selfIndex + ") ~ section > h2"); // all <h2> children in this <h1> element 'h1'

        if (h2List !== null && h2List.length !== 0) {
            h2c = 1;
            for (let h2 of h2List) {
                console.assert(h2.parentElement.tagName === "SECTION");
                const h2InstructionCount = instructions.instructions.length;
                collectionInstructions(h2.parentElement, h1c.toString() + "." + h2c.toString(),null);
                const h2NoInstructions : boolean = h2InstructionCount === instructions.instructions.length;

                let parent = h2.parentElement;
                let selfIndex = [].slice.call(parent.children).indexOf(h2) + 1;
                let h3List = parent.querySelectorAll(":nth-child(" + selfIndex + ") ~ section > h3");
                if (h3List !== null && h3List.length !== 0) {
                    h3c = 1;
                    for (let h3 of h3List) {
                        console.assert(h3.parentElement.tagName === "SECTION");

                        const h3InstructionCount = instructions.instructions.length;
                        collectionInstructions(h3.parentElement, h1c.toString() + "." + h2c.toString() + "." + h3c.toString(),null);
                        const h3NoInstructions : boolean = h3InstructionCount === instructions.instructions.length;

                        // if this <Section> had no Instructions, create Instruction  Category.SECTION
                        if (h3NoInstructions && instructions.instructions.length != h3InstructionCount){
                            instructions.instructions.push(instructions.instructions[instructions.instructions.length-1]);
                            instructions.instructions.copyWithin(h3InstructionCount,h3InstructionCount-1,instructions.instructions.length-2);

                            const section = h3.parentElement;
                            instructions.instructions[h3InstructionCount] = new Instruction(h1c.toString() + "." + h2c.toString() + "." + h3c.toString(), "",
                                (<HTMLHeadingElement>h3).innerText.trimStart().slice(0, 10) + " ...", Category.SECTION, section.dataset.pointFraction !== undefined ? parseInt(section.dataset.pointFraction) : 0 );
                            section.id = instructions.instructions[h3InstructionCount].id;
                        }
                        h3c++;
                    }

                }

                if (h2NoInstructions && instructions.instructions.length != h2InstructionCount){
                    instructions.instructions.push(instructions.instructions[instructions.instructions.length-1]);
                    instructions.instructions.copyWithin(h2InstructionCount,h2InstructionCount-1,instructions.instructions.length-2);

                    const section = h2.parentElement;
                    instructions.instructions[h2InstructionCount] = new Instruction(h1c.toString() + "." + h2c.toString(), "",
                        (<HTMLHeadingElement>h2).innerText.trimStart().slice(0, 10) + " ...", Category.SECTION, section.dataset.pointFraction !== undefined ? parseInt(section.dataset.pointFraction) : 0 );
                    section.id = instructions.instructions[h2InstructionCount].id;
                }                
                h2c++;
            }

        if (h1NoInstructions && instructions.instructions.length != h1InstructionCount){
            instructions.instructions.push(instructions.instructions[instructions.instructions.length-1]);
            instructions.instructions.copyWithin(h1InstructionCount,h1InstructionCount-1,instructions.instructions.length-2);

            const section = h1.parentElement;
            instructions.instructions[h1InstructionCount] = new Instruction(h1c.toString(), "",
                (<HTMLHeadingElement>h1).innerText.trimStart().slice(0, 10) + " ...", Category.SECTION, section.dataset.pointFraction !== undefined ? parseInt(section.dataset.pointFraction) : 0 );
            section.id = instructions.instructions[h1InstructionCount].id;
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
    let rubric : HTMLTableSectionElement = document.querySelector("#RubricTable > tbody");
    let prevSection : string = "";
    const REGEX = /Symbol\(([^)]*)\)/; // for removing Symbol sub-string
    let ri=0;
    for (let instruction of instructions.instructions) {
        let row = document.createElement("tr");
        row.setAttribute("data-ri",ri.toString());
        if (instruction.section === prevSection)
            row.innerHTML =
                `<td class="Empty"></td>
                 <td>${instruction.number}</td>
				 <td>${Category[instruction.category].toLowerCase()}</td>
				 <td><a href="#${instruction.id}">${instruction.short}</a></td>
                 <td><input type="checkbox" id="#CB_${instruction.id}" name="scales"></td>
                 <td>${instruction.pointFraction.toFixed(0)}</td>
                 <td></td>
                 <td></td>
                 <td><input type="text"></td>`;
        else
            row.innerHTML =
                `<td>${instruction.section}</td>
				 <td>${instruction.number}</td>
				 <td>${Category[instruction.category].toLowerCase()}</td>
				 <td><a href="#${instruction.id}">${instruction.short}</a></td>
                 <td><input type="checkbox" id="#CB_${instruction.id}" name="scales"></td>
                 <td>${instruction.pointFraction.toFixed(0)}</td>
                 <td></td>
                 <td></td>
                 <td><input type="text"></td>`;
        prevSection = instruction.section;
        row.querySelector('input[type="text"]').addEventListener('input',
            (e : Event) =>
            {
                const itemID=(<HTMLInputElement>(e.target)).parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.querySelector('a').getAttribute('href');
                const rowIndex=parseInt((<HTMLInputElement>(e.target)).parentElement.parentElement.getAttribute("data-ri"));
                console.log(itemID.slice(1) + ":" + rowIndex + ":" + e);
                console.log(instructions.instructions[rowIndex]);
                instructions.instructions[rowIndex].comment = (<HTMLInputElement>(e.target)).value;
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
        (<HTMLElement> document.querySelector("#CreateGradingRubricXML")).onclick = () => {
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
        let rubricTable_json : string = JSON.stringify(instructions,Instruction.replacer);
        let url = URL.createObjectURL(new Blob([rubricTable_json], {type: 'text/plain; charset=UTF-16'}));

        // create button to open new browser tab with .json file
        (<HTMLElement> document.querySelector("#CreateGradingRubricJSON")).onclick = () => {
            window.open(url);
        };

        // create button to download .json file
        const link : HTMLAnchorElement = document.createElement('a');
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
            studentDirectory = (<HTMLInputElement>e.target).value;//files[0].match(/(.*)[\/\\]/)[1] || '';
            localStorage.setItem('studentDirectory', studentDirectory);
            console.log(studentDirectory);
        });

    return;
}

function computeTimeToRead(h2Element : HTMLHeadElement)
{
    const parts=h2Element.parentElement.querySelectorAll(":scope section > table.SectionRubric > tbody > tr:nth-of-type(1) > td:nth-of-type(2)")
    let sum : number = 0
    for (let td_ of parts)
    {
        const td : HTMLTableDataCellElement = <HTMLTableCellElement> td_;
        const i = parseInt(td.innerText.slice(8).split(' ')[0]);
        sum += i;
    }
    return sum;
}
/**
 \brief GradingScript generates and downloads a Bash script from the browser that
 when executed on the client PC automates various parts of the task of grading a particular <section>'s
 set of instructions (ol.Instructions)

 \todo [PRIORITY=LOW] Long term consider replacing bash script with NodeJS to simplify project maintenance
 */
class GradingScript
{
    category : string;
    projectDirectory : string;

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
DIR=\`cygpath -u "${studentDirectory}"\`/${this.projectDirectory}
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
    start "${visualStudio}" $SLN
    
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

