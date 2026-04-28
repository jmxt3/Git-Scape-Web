![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d22f70ecef3c9356822a_928166e443bc1b1f19ebadf4fd11b7c45fce4153-1000x1000.svg)

# 

How

to

create

Skills:

Key

steps,

limitations,

and

examples

Learn how to write tailored skills that deliver stronger, more effective outputs from Claude.

[](#)

[](#)

*   Category
    
    [Claude Code](https://claude.com/blog/category/claude-code)
    
    [Agents](https://claude.com/blog/category/agents)
    
*   Product
    
    Claude apps
    
*   Date
    
    November 19, 2025
    
*   Reading time
    
    5
    
    min
    
*   Share
    
    [Copy link](#)
    

[Skills](https://www.claude.com/blog/skills) are custom instructions that extend Claude's capabilities for specific tasks or domains. 

When you create a skill via a [SKILL.md](http://skill.md) file, you're teaching Claude how to handle specific scenarios more effectively. The power of skills lies in their ability to encode institutional knowledge, standardize outputs, and handle complex multi-step workflows that would otherwise require repeated explanation or investment in building a custom agent.

Learn how to create skills that transform Claude from general-purpose assistant into specialized expert for your specific workflows either with our [skill creator](https://github.com/anthropics/skills/tree/main/skill-creator) template or manually. (Pro-tip: to make it easy, we recommend building your [SKILL.md](http://skill.md) file with this template and tailoring from there).

## **Creating a skill in 5 steps**

Follow this structured approach to build skills that trigger more reliably.

### **1\. Understand the core requirements**

Before writing anything, clarify what problem your skill solves. Strong skills address concrete needs with measurable outcomes. "Extract financial data from PDFs and format as CSV" beats "Help with my finance stuff" because it specifies the input format, the operation, and the expected output.

Start by asking yourself: What specific task does this skill accomplish? What triggers should activate it? What does success look like? What are the edge cases or limitations?

### **2\. Write the name**

Your skill needs three core components: **name** (clear identifier), **description** (when to activate), and **instructions** (how to execute). In fact, the name and description are the only parts of the [SKILL.md](http://skill.md) file that influence triggering, in other words, the ability for Claude  to call a skill for specialized knowledge or workflows. 

The name should be straightforward and descriptive. Use lowercase with hyphens (e.g., pdf-editor, brand-guidelines). Keep it short and clear.

### **3\. Write the description field**

The description determines when your skill activates, making it the most critical component. Write it from Claude's perspective, focusing on triggers, capabilities, and use cases.

A strong description balances several elements: specific capabilities, clear triggers, relevant context, and boundaries.

**Weak description**:

```markdown
This skill helps with PDFs and documents.
```

**Strong description**:

```markdown
Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale. Use for document workflows and batch operations. Not for simple PDF viewing or basic conversions.
```

The stronger version gives Claude multiple data points: specific verbs (extract, create, merge), concrete use cases (form filling, batch operations), and clear boundaries (not for simple viewing).

### **4\. Write the main instructions**

Your instructions should be structured, scannable, and actionable. Use markdown headers, bullet points for options, and code blocks for examples.

Structure with clear hierarchy: overview, prerequisites, execution steps, examples, error handling, and limitations. Break complex workflows into discrete phases with clear inputs and outputs.

Include concrete examples showing correct usage. Specify what the skill cannot do to prevent misuse and manage expectations. Your [SKILL.md](http://skill.md) file can also include additional reference files and assets to provide even more clarity and guidance around what you’re asking the agent to do when the skill is triggered. 

### **5\. Upload your skill** 

Depending on what Claude surface you’re building on, here’s how to upload your skill for use: 

*   [Claude.ai](http://claude.ai/redirect/claudedotcom.v1.36dd794a-8114-49fd-a50b-212bb98593c8) (Claude apps): Go to **Settings** and add your custom skill there. Custom skills require a Pro, Max, Team, or Enterprise plan with code execution enabled. Skills uploaded here are individual to each user—they are not shared organization-wide and cannot be centrally managed by admins.
*   [Claude Code](https://www.claude.com/product/claude-code): Create a skills/ directory in your plugin or project root and add skill folders containing SKILL.md files. Claude discovers and uses them automatically when the plugin is installed. Example structure:

```markdown
my-project/
├── skills/
│   └── my-skill/
│       └── SKILL.md
```

*   [Claude Developer Platform](https://www.claude.com/platform/api): Upload skills via the Skills API (/v1/skills endpoints). Use a POST request with the required beta headers:

```markdown
curl -X POST "https://api.anthropic.com/v1/skills" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: skills-2025-10-02" \
  -F "display_title=My Skill Name" \
  -F "files[]=@my-skill/SKILL.md;filename=my-skill/SKILL.md"
```

### **4\. Testing and validation**

Test your skill with realistic scenarios before deploying it. Systematic testing reveals gaps in instructions, ambiguities in descriptions, and unexpected edge cases that only surface during actual use.

Create a test matrix covering three scenarios:

*   **Normal operations**: Test the skill with typical requests it should handle perfectly. If you built a financial analysis skill, try "analyze Microsoft's latest earnings" or "build a datapack for this 10-K filing." These baseline tests confirm your instructions work as intended.
*   **Edge cases**: Test with incomplete or unusual inputs. What happens when data is missing? When file formats are unexpected? When users provide ambiguous instructions? Your skill should handle these gracefully—either producing degraded but useful output or explaining what's needed to proceed.
*   **Out-of-scope requests**: Test with tasks that seem related but shouldn't trigger your skill. If you built an NDA review skill, try requesting "review this employment agreement" or "analyze this lease." The skill should stay dormant, letting other skills or general Claude capabilities handle the request.

Consider implementing the following tests for even deeper validation:

*   **Triggering tests:** Does the skill activate when expected? Test with both explicit requests ("use the financial datapack skill to analyze this company") and natural requests ("help me understand this company's financials"). Does it stay inactive when irrelevant? A well-scoped skill knows when not to activate. Test similar but distinct requests to verify boundaries.
*   **Functional tests:** These include output consistency (do multiple runs with similar inputs produce comparable results?), usability (can someone unfamiliar with the domain use it successfully?), and documentation accuracy (do your examples match actual behavior?). 

### **5\. Iterate based on usage**

Monitor how your skill performs in real-world usage. Refine descriptions if triggering is inconsistent. Clarify instructions if outputs vary unexpectedly. As with prompts, the best skills evolve through practical application.

## **General best practices for creating skills**

These principles help you create skills that are maintainable, reusable, and genuinely useful rather than theoretical.

### **Start with use cases**

Don't write skills speculatively. Build them when you have real, repeated tasks. The best skills solve problems you encounter regularly.

Before creating a skill, ask: Have I done this task at least five times? Will I do it at least ten more times? If yes, a skill makes sense.

### **Define success criteria—and include it in the skill**

Tell Claude what a good out looks like. If you're creating financial reports, specify required sections, formatting standards, validation checks, and quality thresholds. Include these criteria in your instructions so Claude can self-check.

### **Use the Skill-Creator skill**

The [skill-creator skill](https://github.com/anthropics/skills/tree/main/skill-creator) guides you through creating well-structured skills. It asks clarifying questions, suggests description improvements, and helps format instructions properly. Available in the [Skills repository on GitHub](https://github.com/anthropics/skills) and directly via [Claude.ai](http://claude.ai/redirect/claudedotcom.v1.36dd794a-8114-49fd-a50b-212bb98593c8), it's particularly valuable for your first few skills.

## **Skill limitations and considerations**

Understanding how skills work—and their boundaries—helps you design more effective skills and set appropriate expectations.

### **Skill triggering**

Claude evaluates skill descriptions against your request to determine relevance. This isn't keyword matching—Claude understands semantic relationships. However, vague descriptions reduce triggering accuracy.

Multiple skills can activate simultaneously if they address different aspects of a complex task. Overly generic descriptions cause inappropriate activation, while missing use cases cause missed activations.

### **Appropriate file sizes**

When writing skills, avoid bloating the context window with unnecessary content. Consider whether each piece of information needs to be loaded every time, or only conditionally.

Use a "menu" approach: if your skill covers multiple distinct processes or options, the SKILL.md should describe what's available and use relative paths to reference separate files for each. Claude then reads only the file relevant to the user's task, leaving the others untouched for that conversation.

These separate files don't need to represent mutually exclusive paths. The key principle is breaking content into reasonable chunks and letting Claude select what's needed based on the task at hand.

## ‍**Real-world skills examples**

### **Skill example #1:** [**docx creation skill**](https://github.com/anthropics/skills/tree/main/document-skills/docx)

````markdown
#---
name: docx
description: "Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX creation, editing, and analysis

## Overview

A user may ask you to create, edit, or analyze the contents of a .docx file. A .docx file is essentially a ZIP archive containing XML files and other resources that you can read or edit. You have different tools and workflows available for different tasks.

## Workflow Decision Tree

### Reading/Analyzing Content
Use "Text extraction" or "Raw XML access" sections below

### Creating New Document
Use "Creating a new Word document" workflow

### Editing Existing Document
- **Your own document + simple changes**
  Use "Basic OOXML editing" workflow

- **Someone else's document**
  Use **"Redlining workflow"** (recommended default)

- **Legal, academic, business, or government docs**
  Use **"Redlining workflow"** (required)

## Reading and analyzing content

### Text extraction
If you just need to read the text contents of a document, you should convert the document to markdown using pandoc. Pandoc provides excellent support for preserving document structure and can show tracked changes:

```bash
# Convert document to markdown with tracked changes
pandoc --track-changes=all path-to-file.docx -o output.md
# Options: --track-changes=accept/reject/all
```

### Raw XML access
You need raw XML access for: comments, complex formatting, document structure, embedded media, and metadata. For any of these features, you'll need to unpack a document and read its raw XML contents.

#### Unpacking a file
`python ooxml/scripts/unpack.py <office_file> <output_directory>`

#### Key file structures
* `word/document.xml` - Main document contents
* `word/comments.xml` - Comments referenced in document.xml
* `word/media/` - Embedded images and media files
* Tracked changes use `<w:ins>` (insertions) and `<w:del>` (deletions) tags

## Creating a new Word document

When creating a new Word document from scratch, use **docx-js**, which allows you to create Word documents using JavaScript/TypeScript.

### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read [`docx-js.md`](docx-js.md) (~500 lines) completely from start to finish. **NEVER set any range limits when reading this file.** Read the full file content for detailed syntax, critical formatting rules, and best practices before proceeding with document creation.
2. Create a JavaScript/TypeScript file using Document, Paragraph, TextRun components (You can assume all dependencies are installed, but if not, refer to the dependencies section below)
3. Export as .docx using Packer.toBuffer()

## Editing an existing Word document

When editing an existing Word document, use the **Document library** (a Python library for OOXML manipulation). The library automatically handles infrastructure setup and provides methods for document manipulation. For complex scenarios, you can access the underlying DOM directly through the library.

### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read [`ooxml.md`](ooxml.md) (~600 lines) completely from start to finish. **NEVER set any range limits when reading this file.** Read the full file content for the Document library API and XML patterns for directly editing document files.
2. Unpack the document: `python ooxml/scripts/unpack.py <office_file> <output_directory>`
3. Create and run a Python script using the Document library (see "Document Library" section in ooxml.md)
4. Pack the final document: `python ooxml/scripts/pack.py <input_directory> <office_file>`

The Document library provides both high-level methods for common operations and direct DOM access for complex scenarios.

## Redlining workflow for document review

This workflow allows you to plan comprehensive tracked changes using markdown before implementing them in OOXML. **CRITICAL**: For complete tracked changes, you must implement ALL changes systematically.

**Batching Strategy**: Group related changes into batches of 3-10 changes. This makes debugging manageable while maintaining efficiency. Test each batch before moving to the next.

**Principle: Minimal, Precise Edits**
When implementing tracked changes, only mark text that actually changes. Repeating unchanged text makes edits harder to review and appears unprofessional. Break replacements into: [unchanged text] + [deletion] + [insertion] + [unchanged text]. Preserve the original run's RSID for unchanged text by extracting the `<w:r>` element from the original and reusing it.

Example - Changing "30 days" to "60 days" in a sentence:
```python
# BAD - Replaces entire sentence
'<w:del><w:r><w:delText>The term is 30 days.</w:delText></w:r></w:del><w:ins><w:r><w:t>The term is 60 days.</w:t></w:r></w:ins>'

# GOOD - Only marks what changed, preserves original <w:r> for unchanged text
'<w:r w:rsidR="00AB12CD"><w:t>The term is </w:t></w:r><w:del><w:r><w:delText>30</w:delText></w:r></w:del><w:ins><w:r><w:t>60</w:t></w:r></w:ins><w:r w:rsidR="00AB12CD"><w:t> days.</w:t></w:r>'
```

### Tracked changes workflow

1. **Get markdown representation**: Convert document to markdown with tracked changes preserved:
   ```bash
   pandoc --track-changes=all path-to-file.docx -o current.md
   ```

2. **Identify and group changes**: Review the document and identify ALL changes needed, organizing them into logical batches:

   **Location methods** (for finding changes in XML):
   - Section/heading numbers (e.g., "Section 3.2", "Article IV")
   - Paragraph identifiers if numbered
   - Grep patterns with unique surrounding text
   - Document structure (e.g., "first paragraph", "signature block")
   - **DO NOT use markdown line numbers** - they don't map to XML structure

   **Batch organization** (group 3-10 related changes per batch):
   - By section: "Batch 1: Section 2 amendments", "Batch 2: Section 5 updates"
   - By type: "Batch 1: Date corrections", "Batch 2: Party name changes"
   - By complexity: Start with simple text replacements, then tackle complex structural changes
   - Sequential: "Batch 1: Pages 1-3", "Batch 2: Pages 4-6"

3. **Read documentation and unpack**:
   - **MANDATORY - READ ENTIRE FILE**: Read [`ooxml.md`](ooxml.md) (~600 lines) completely from start to finish. **NEVER set any range limits when reading this file.** Pay special attention to the "Document Library" and "Tracked Change Patterns" sections.
   - **Unpack the document**: `python ooxml/scripts/unpack.py <file.docx> <dir>`
   - **Note the suggested RSID**: The unpack script will suggest an RSID to use for your tracked changes. Copy this RSID for use in step 4b.

4. **Implement changes in batches**: Group changes logically (by section, by type, or by proximity) and implement them together in a single script. This approach:
   - Makes debugging easier (smaller batch = easier to isolate errors)
   - Allows incremental progress
   - Maintains efficiency (batch size of 3-10 changes works well)

   **Suggested batch groupings:**
   - By document section (e.g., "Section 3 changes", "Definitions", "Termination clause")
   - By change type (e.g., "Date changes", "Party name updates", "Legal term replacements")
   - By proximity (e.g., "Changes on pages 1-3", "Changes in first half of document")

   For each batch of related changes:

   **a. Map text to XML**: Grep for text in `word/document.xml` to verify how text is split across `<w:r>` elements.

   **b. Create and run script**: Use `get_node` to find nodes, implement changes, then `doc.save()`. See **"Document Library"** section in ooxml.md for patterns.

   **Note**: Always grep `word/document.xml` immediately before writing a script to get current line numbers and verify text content. Line numbers change after each script run.

5. **Pack the document**: After all batches are complete, convert the unpacked directory back to .docx:
   ```bash
   python ooxml/scripts/pack.py unpacked reviewed-document.docx
   ```

6. **Final verification**: Do a comprehensive check of the complete document:
   - Convert final document to markdown:
     ```bash
     pandoc --track-changes=all reviewed-document.docx -o verification.md
     ```
   - Verify ALL changes were applied correctly:
     ```bash
     grep "original phrase" verification.md  # Should NOT find it
     grep "replacement phrase" verification.md  # Should find it
     ```
   - Check that no unintended changes were introduced


## Converting Documents to Images

To visually analyze Word documents, convert them to images using a two-step process:

1. **Convert DOCX to PDF**:
   ```bash
   soffice --headless --convert-to pdf document.docx
   ```

2. **Convert PDF pages to JPEG images**:
   ```bash
   pdftoppm -jpeg -r 150 document.pdf page
   ```
   This creates files like `page-1.jpg`, `page-2.jpg`, etc.

Options:
- `-r 150`: Sets resolution to 150 DPI (adjust for quality/size balance)
- `-jpeg`: Output JPEG format (use `-png` for PNG if preferred)
- `-f N`: First page to convert (e.g., `-f 2` starts from page 2)
- `-l N`: Last page to convert (e.g., `-l 5` stops at page 5)
- `page`: Prefix for output files

Example for specific range:
```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 document.pdf page  # Converts only pages 2-5
```

## Code Style Guidelines
**IMPORTANT**: When generating code for DOCX operations:
- Write concise code
- Avoid verbose variable names and redundant operations
- Avoid unnecessary print statements

## Dependencies

Required dependencies (install if not available):

- **pandoc**: `sudo apt-get install pandoc` (for text extraction)
- **docx**: `npm install -g docx` (for creating new documents)
- **LibreOffice**: `sudo apt-get install libreoffice` (for PDF conversion)
- **Poppler**: `sudo apt-get install poppler-utils` (for pdftoppm to convert PDF to images)
- **defusedxml**: `pip install defusedxml` (for secure XML parsing)
````

**What makes it strong**: Provides a clear decision tree that routes Claude to the right workflow based on task type, uses progressive disclosure to keep the main file lean while referencing detailed implementation files only when needed, and includes concrete good/bad examples that show exactly how to implement complex patterns like tracked changes.

### **Skill example #2:** [**Brand guidelines**](https://github.com/anthropics/skills/blob/main/brand-guidelines/SKILL.md?plain=1)

```markdown
#name: brand-guidelines
description: Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.
license: Complete terms in LICENSE.txt
---

# Anthropic Brand Styling

## Overview

To access Anthropic's official brand identity and style resources, use this skill.

**Keywords**: branding, corporate identity, visual identity, post-processing, styling, brand colors, typography, Anthropic brand, visual formatting, visual design

## Brand Guidelines

### Colors

**Main Colors:**

- Dark: `#141413` - Primary text and dark backgrounds
- Light: `#faf9f5` - Light backgrounds and text on dark
- Mid Gray: `#b0aea5` - Secondary elements
- Light Gray: `#e8e6dc` - Subtle backgrounds

**Accent Colors:**

- Orange: `#d97757` - Primary accent
- Blue: `#6a9bcc` - Secondary accent
- Green: `#788c5d` - Tertiary accent

### Typography

- **Headings**: Poppins (with Arial fallback)
- **Body Text**: Lora (with Georgia fallback)
- **Note**: Fonts should be pre-installed in your environment for best results

## Features

### Smart Font Application

- Applies Poppins font to headings (24pt and larger)
- Applies Lora font to body text
- Automatically falls back to Arial/Georgia if custom fonts unavailable
- Preserves readability across all systems

### Text Styling

- Headings (24pt+): Poppins font
- Body text: Lora font
- Smart color selection based on background
- Preserves text hierarchy and formatting

### Shape and Accent Colors

- Non-text shapes use accent colors
- Cycles through orange, blue, and green accents
- Maintains visual interest while staying on-brand

## Technical Details

### Font Management

- Uses system-installed Poppins and Lora fonts when available
- Provides automatic fallback to Arial (headings) and Georgia (body)
- No font installation required - works with existing system fonts
- For best results, pre-install Poppins and Lora fonts in your environment

### Color Application

- Uses RGB color values for precise brand matching
- Applied via python-pptx's RGBColor class
- Maintains color fidelity across different systems
```

**What makes it strong**: Provides precise, actionable information Claude doesn't inherently have (exact hex codes, font names, size thresholds) with a clear description that tells Claude both what it does and when to trigger it.

**What makes it strong**: Creative capability with clear boundaries, copyright protection built in, technical scaffolding for non-musicians, quality standards.

### **Skill example #3:** [**frontend design skill**](https://www.claude.com/blog/improving-frontend-design-through-skills)

```markdown
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
```

**What makes it strong**: Creative capability with clear boundaries, copyright protection built in, technical scaffolding for non-musicians, quality standards.

## **Common questions**

### **How do I write descriptions that actually trigger?**

Focus on capabilities and scenarios, not generic keywords. Include action verbs, specific file types, and clear use cases. Instead of "document processing skill," write "extract tables from PDFs and convert to CSV format for data analysis workflows."

### **How does Claude decide which skills to invoke?**

Claude evaluates your request against skill descriptions using semantic understanding. It's not keyword matching—Claude determines contextual relevance. Multiple skills can activate if they address different aspects of your request.

### **What's the right granularity for my descriptions?**

Aim for single-purpose skills. "SEO optimization for blog posts" is focused enough for specific instructions while broad enough for reusability. Too broad: "Content marketing helper." Too narrow: "Add meta descriptions."

### **How do I share Skills across my organization?**

Regardless of your team size, we suggest creating a shared document repository with skill specifications. 

**For smaller teams**, use a template format with name, description, instructions, and version info.

**For medium to large teams**, establish a skills governance process:

*   Designate skill owners for each domain (finance, legal, marketing)
*   Maintain a central wiki or shared drive as your skill library
*   Include usage examples and common troubleshooting for each skill
*   Version your skills and document changes in a changelog
*   Schedule quarterly reviews to update or retire outdated skills

**Best practices for all team sizes**:

*   Document the business purpose for each skill
*   Assign clear ownership for maintenance and updates
*   Create onboarding materials showing new team members how to implement shared skills
*   Track which skills deliver the most value to prioritize maintenance efforts
*   Use consistent naming conventions so skills are easy to find

Enterprise customers can work with Anthropic's customer success team to explore additional deployment options and governance frameworks.

### **How do I debug skills?**

Test triggering and execution separately. If skills don't activate, broaden your description and add use cases. If results are inconsistent, add specificity to instructions and include validation steps. Create a test case library covering normal usage, edge cases, and out-of-scope requests.

### **How do I share Skills across my organization?**

**‍**In [Claude.ai](http://claude.ai/redirect/claudedotcom.v1.36dd794a-8114-49fd-a50b-212bb98593c8), Skills are currently individual to each user, though org-wide management and sharing capabilities are coming soon. In the meantime, regardless of your team size, we suggest creating a shared document repository with skill specifications. This prepares your organization for upcoming features while establishing good governance practices today.

## **Get started**

Ready to build with Skills? Here's how to start:

[Claude.ai](https://claude.ai/redirect/claudedotcom.v1.36dd794a-8114-49fd-a50b-212bb98593c8) users:

*   Enable Skills in Settings → Features
*   Create your first project at claude.ai/projects
*   Try combining project knowledge with Skills for your next analysis task

API developers:

*   Explore the Skills endpoint in [documentation](https://docs.anthropic.com/)
*   Check out our [skills cookbook](https://platform.claude.com/cookbook/skills-notebooks-01-skills-introduction)

Claude Code users:

*   Install Skills via [plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
*   Check out our [skills cookbook](https://platform.claude.com/cookbook/skills-notebooks-01-skills-introduction)

No items found.

[Prev](#)Prev

0/5

[Next](#)Next

eBook

## Agent Skills

Start using Skills with Claude to build more powerful applications today.

Get started

[Get started](https://www.claude.com/blog/skills)Get started

![](https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/6889473610b50328dbb70b58_placeholder.svg)

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6915038fea2f5466c171c21f_Hand-NodeWeb.svg)![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/691503928e574d7dc8407b4a_Hand-NodeWeb-1.svg)

FAQ

No items found.

[](#)

## Related posts

Explore more product news and best practices for teams building with Claude.

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d22bed4b18b6703cd710_e750c875fbd7f08ffb6495efa180a8ed60de3611-1000x1000.svg)

Apr 22, 2026

### Building agents that reach production systems with MCP

Agents

[Building agents that reach production systems with MCP](#)Building agents that reach production systems with MCP

[Building agents that reach production systems with MCP](/blog/building-agents-that-reach-production-systems-with-mcp)Building agents that reach production systems with MCP

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d2222403b092e0358b0e_cd4fd51deacd067d4e30aee4f4b149f6cba1b97b-1000x1000.svg)

Apr 20, 2026

### Meet the winners of our Built with Opus 4.6 Claude Code hackathon

Claude Code

[Meet the winners of our Built with Opus 4.6 Claude Code hackathon](#) Meet the winners of our Built with Opus 4.6 Claude Code hackathon

[Meet the winners of our Built with Opus 4.6 Claude Code hackathon](/blog/meet-the-winners-of-our-built-with-opus-4-6-claude-code-hackathon) Meet the winners of our Built with Opus 4.6 Claude Code hackathon

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d22d7d4c10df6024f7bc_ee580919acaba2ddc07425f7a7390c8962cadc94-1000x1000.svg)

Apr 16, 2026

### Best practices for using Claude Opus 4.7 with Claude Code

Claude Code

[Best practices for using Claude Opus 4.7 with Claude Code](#)Best practices for using Claude Opus 4.7 with Claude Code

[Best practices for using Claude Opus 4.7 with Claude Code](/blog/best-practices-for-using-claude-opus-4-7-with-claude-code)Best practices for using Claude Opus 4.7 with Claude Code

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/692f76874e94e489958af8ba_Object-CodeMagnifier.svg)

Apr 15, 2026

### Using Claude Code: session management and 1M context

Claude Code

[Using Claude Code: session management and 1M context](#)Using Claude Code: session management and 1M context

[Using Claude Code: session management and 1M context](/blog/using-claude-code-session-management-and-1m-context)Using Claude Code: session management and 1M context

## Transform how your organization operates with Claude

See pricing

[See pricing](https://claude.com/pricing#api)See pricing

Contact sales

[Contact sales](https://claude.com/contact-sales)Contact sales

Get the developer newsletter

Product updates, how-tos, community spotlights, and more. Delivered monthly to your inbox.

[Subscribe](#)Subscribe

Please provide your email address if you'd like to receive our monthly developer newsletter. You can unsubscribe at any time.

Thank you! You’re subscribed.

Sorry, there was a problem with your submission, please try again later.