![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d2307f9555d7c1bc46cb_77dd9077412abc790bf2bc6fa3383b37724d6305-1000x1000.svg)

# 

Introducing

Agent

Skills

[](#)

[](#)

*   Category
    
    [Product announcements](https://claude.com/blog/category/announcements)
    
*   Product
    
    Claude Platform
    
*   Date
    
    October 16, 2025
    
*   Reading time
    
    5
    
    min
    
*   Share
    
    [Copy link](#)
    

***Update:*** *We've added* [*organization-wide management for skills*](/blog/organization-skills-and-directory)*, a* [*directory*](https://claude.com/connectors) *featuring partner-built skills, and published* [*Agent Skills*](https://agentskills.io) *as an open standard for cross-platform portability. (December 18, 2025)*

Claude can now use *Skills* to improve how it performs specific tasks. Skills are folders that include instructions, scripts, and resources that Claude can load when needed.

Claude will only access a skill when it's relevant to the task at hand. When used, skills make Claude better at specialized tasks like working with Excel or following your organization's brand guidelines.

You've already seen Skills at work in Claude apps, where Claude uses them to create files like spreadsheets and presentations. Now, you can build your own skills and use them across Claude apps, Claude Code, and our API.

## How Skills work

While working on tasks, Claude scans available skills to find relevant matches. When one matches, it loads only the minimal information and files needed—keeping Claude fast while accessing specialized expertise.

Skills are:

*   **Composable**: Skills stack together. Claude automatically identifies which skills are needed and coordinates their use.
*   **Portable**: Skills use the same format everywhere. Build once, use across Claude apps, Claude Code, and API.
*   **Efficient**: Only loads what's needed, when it's needed.
*   **Powerful**: Skills can include executable code for tasks where traditional programming is more reliable than token generation.

Think of Skills as custom onboarding materials that let you package expertise, making Claude a specialist on what matters most to you. For a technical deep-dive on the Agent Skills design pattern, architecture, and development best practices, read our [engineering blog.](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

## Skills work with every Claude product

### **Claude apps**

Skills are available to Pro, Max, Team and Enterprise users. We provide skills for common tasks like document creation, examples you can customize, and the ability to create your own custom skills.

![The Skills capabilities interface in Claude.ai with example Skills toggled on. ](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/690267e194f8fd4618cb330e_image.webp)

Claude automatically invokes relevant skills based on your task—no manual selection needed. You'll even see skills in Claude's chain of thought as it works.  
  
Creating skills is simple. The "skill-creator" skill provides interactive guidance: Claude asks about your workflow, generates the folder structure, formats the SKILL.md file, and bundles the resources you need. No manual file editing required.

Enable Skills in [Settings](https://claude.ai/redirect/website.v1.51f73c97-b077-44e7-85ba-8b27a025dfdf/settings/features). For Team and Enterprise users, admins must first enable Skills organization-wide.

### **Claude Developer Platform (API)**

Agent Skills, which we often refer to simply as Skills, can now be added to Messages API requests and the new `/v1/skills` endpoint gives developers programmatic control over custom skill versioning and management. Skills require the [Code Execution Tool](https://docs.claude.com/en/docs/agents-and-tools/tool-use/code-execution-tool) beta, which provides the secure environment they need to run.

Use Anthropic-created skills to have Claude read and generate professional Excel spreadsheets with formulas, PowerPoint presentations, Word documents, and fillable PDFs. Developers can create custom Skills to extend Claude's capabilities for their specific use cases.

Developers can also easily create, view, and upgrade skill versions through the Claude Console.

Explore the [documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) , our [skills cookbook](https://platform.claude.com/cookbook/skills-notebooks-01-skills-introduction), or [Anthropic Academy](https://www.anthropic.com/learn/build-with-claude) to learn more.

‍

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5faa6352b26bf7542cb9b_logo_rakuten-light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5fab610bf0d091b541153_logo_rakuten-dark.svg)

Skills streamline our management accounting and finance workflows. Claude processes multiple spreadsheets, catches critical anomalies, and generates reports using our procedures. What once took a day, we can now accomplish in an hour.

Yusuke Kaji, General Manager AI

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8c287936531790c85c4_box_light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8bdc1ea299a1a768655_box_dark.svg)

Skills teaches Claude how to work with Box content. Users can transform stored files into PowerPoint presentations, Excel spreadsheets, and Word documents that follow their organization's standards—saving hours of effort.

Yashodha Bhavnani, Head of AI

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a94f6f82b1f84f489887_Canva_light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a94baddb6685c1e5410d_Canva_dark.svg)

Canva plans to leverage Skills to customize agents and expand what they can do. This unlocks new ways to bring Canva deeper into agentic workflows—helping teams capture their unique context and create stunning, high-quality designs effortlessly.

Anwar Haneef, GM & Head of Ecosystem

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68ba17a186e44af7d97dae57_Frame.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68ba179c1c4432fa78b2f126_Frame-1.svg)

With Skills, Claude works seamlessly with Notion - taking users from questions to action faster. Less prompt wrangling on complex tasks, more predictable results.

MJ Felix, Product Manager

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5faa6352b26bf7542cb9b_logo_rakuten-light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5fab610bf0d091b541153_logo_rakuten-dark.svg)

Skills streamline our management accounting and finance workflows. Claude processes multiple spreadsheets, catches critical anomalies, and generates reports using our procedures. What once took a day, we can now accomplish in an hour.

Yusuke Kaji, General Manager AI

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8c287936531790c85c4_box_light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8bdc1ea299a1a768655_box_dark.svg)

Skills teaches Claude how to work with Box content. Users can transform stored files into PowerPoint presentations, Excel spreadsheets, and Word documents that follow their organization's standards—saving hours of effort.

Yashodha Bhavnani, Head of AI

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a94f6f82b1f84f489887_Canva_light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a94baddb6685c1e5410d_Canva_dark.svg)

Canva plans to leverage Skills to customize agents and expand what they can do. This unlocks new ways to bring Canva deeper into agentic workflows—helping teams capture their unique context and create stunning, high-quality designs effortlessly.

Anwar Haneef, GM & Head of Ecosystem

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68ba17a186e44af7d97dae57_Frame.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68ba179c1c4432fa78b2f126_Frame-1.svg)

With Skills, Claude works seamlessly with Notion - taking users from questions to action faster. Less prompt wrangling on complex tasks, more predictable results.

MJ Felix, Product Manager

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5faa6352b26bf7542cb9b_logo_rakuten-light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5fab610bf0d091b541153_logo_rakuten-dark.svg)

Skills streamline our management accounting and finance workflows. Claude processes multiple spreadsheets, catches critical anomalies, and generates reports using our procedures. What once took a day, we can now accomplish in an hour.

Yusuke Kaji, General Manager AI

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8c287936531790c85c4_box_light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8bdc1ea299a1a768655_box_dark.svg)

Skills teaches Claude how to work with Box content. Users can transform stored files into PowerPoint presentations, Excel spreadsheets, and Word documents that follow their organization's standards—saving hours of effort.

Yashodha Bhavnani, Head of AI

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a94f6f82b1f84f489887_Canva_light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a94baddb6685c1e5410d_Canva_dark.svg)

Canva plans to leverage Skills to customize agents and expand what they can do. This unlocks new ways to bring Canva deeper into agentic workflows—helping teams capture their unique context and create stunning, high-quality designs effortlessly.

Anwar Haneef, GM & Head of Ecosystem

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68ba17a186e44af7d97dae57_Frame.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68ba179c1c4432fa78b2f126_Frame-1.svg)

With Skills, Claude works seamlessly with Notion - taking users from questions to action faster. Less prompt wrangling on complex tasks, more predictable results.

MJ Felix, Product Manager

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5faa6352b26bf7542cb9b_logo_rakuten-light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68d5fab610bf0d091b541153_logo_rakuten-dark.svg)

Skills streamline our management accounting and finance workflows. Claude processes multiple spreadsheets, catches critical anomalies, and generates reports using our procedures. What once took a day, we can now accomplish in an hour.

Yusuke Kaji, General Manager AI

![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8c287936531790c85c4_box_light.svg)![Logo](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/68b5a8bdc1ea299a1a768655_box_dark.svg)

Skills teaches Claude how to work with Box content. Users can transform stored files into PowerPoint presentations, Excel spreadsheets, and Word documents that follow their organization's standards—saving hours of effort.

Yashodha Bhavnani, Head of AI

[Prev](#)Prev

1/4

[Next](#)Next

eBook

[](#)

![](https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/6889473610b50328dbb70b58_placeholder.svg)

![](https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/6889473610b50328dbb70b58_placeholder.svg)![](https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/6889473610b50328dbb70b58_placeholder.svg)

### **Claude Code**

Skills extend Claude Code with your team's expertise and workflows. Install skills via plugins from the anthropics/skills marketplace. Claude loads them automatically when relevant. Share skills through version control with your team. You can also manually install skills by adding them to `~/.claude/skills`. The Claude Agent SDK provides the same Agent Skills support for building custom agents.

## Getting started

*   **Claude apps:** [User Guide](https://support.claude.com/en/articles/12580051-teach-claude-your-way-of-working-using-skills) & [Help Center](https://support.claude.com/en/articles/12512176-what-are-skills)
*   **API developers:** [Documentation](https://docs.claude.com/en/api/skills-guide)
*   **Claude Code:** [Documentation](https://docs.claude.com/en/docs/claude-code/skills)
*   **Example Skills to customize:** [GitHub repository](https://github.com/anthropics/skills)

## What's next

We're working toward simplified skill creation workflows and enterprise-wide deployment capabilities, making it easier for organizations to distribute skills across teams.

Keep in mind, this feature gives Claude access to execute code. While powerful, it means being mindful about which skills you use—stick to trusted sources to keep your data safe. [Learn more](https://support.claude.com/en/articles/12512180-using-skills-in-claude#h_2746475e70).

FAQ

No items found.

[](#)

## Related posts

Explore more product news and best practices for teams building with Claude.

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d22a8c18ce1b5adef7e9_6b1470e7fa2fb7280502291f204b88c412690076-1000x1000.svg)

Apr 23, 2026

### New connectors in Claude for everyday life

Product announcements

[New connectors in Claude for everyday life](#)New connectors in Claude for everyday life

[New connectors in Claude for everyday life](/blog/connectors-for-everyday-life)New connectors in Claude for everyday life

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6909386cc7ad3ed2a7ec8eed_Object-ThoughtBubble.svg)

Sep 11, 2025

### Bringing memory to Claude

Product announcements

[Bringing memory to Claude](#)Bringing memory to Claude

[Bringing memory to Claude](/blog/memory)Bringing memory to Claude

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d225e31f7aa22c1f28cb_46e4aa7ea208ed440d5bd9e9e3a0ee66bc336ff1-1000x1000.svg)

Apr 23, 2026

### Built-in memory for Claude Managed Agents

Product announcements

[Built-in memory for Claude Managed Agents](#)Built-in memory for Claude Managed Agents

[Built-in memory for Claude Managed Agents](/blog/claude-managed-agents-memory)Built-in memory for Claude Managed Agents

![](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6903d224f466b800c4a5a016_a7b8978859371a024139418f3366bb0600ee1675-1000x1000.svg)

Mar 12, 2026

### Claude now creates interactive charts, diagrams and visualizations

Product announcements

[Claude now creates interactive charts, diagrams and visualizations](#)Claude now creates interactive charts, diagrams and visualizations

[Claude now creates interactive charts, diagrams and visualizations](/blog/claude-builds-visuals)Claude now creates interactive charts, diagrams and visualizations

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