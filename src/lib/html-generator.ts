/**
 * HTML Generator for Mindmap
 * Generates a standalone HTML file with embedded mindmap data
 */

import type { MindmapNode } from './mm-parser'

/**
 * Generate a standalone HTML file containing the interactive mindmap
 * @param data - The parsed mindmap tree
 * @param title - Title for the HTML document
 * @returns Complete HTML string ready to be saved as a file
 */
export function generateMindmapHTML(data: MindmapNode, title: string): string {
  const jsonData = JSON.stringify(data, null, 2)

  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        /* ═══════════════════════════════════════════════════════════════
           DESIGN SYSTEM - Edit these variables to customize your mindmap
           ═══════════════════════════════════════════════════════════════ */
        :root {
            /* Layout Spacing */
            --mm-level-gap: 200px;          /* Horizontal distance between depth levels */
            --mm-node-gap: 12px;            /* Minimum vertical gap between sibling nodes */
            --mm-node-padding-x: 16px;      /* Horizontal padding inside nodes */
            --mm-node-padding-y: 10px;      /* Vertical padding inside nodes */
            --mm-circle-radius: 6px;        /* Expand/collapse circle size */
            --mm-circle-offset: 8px;        /* Distance of circle from node edge */
            
            /* Typography */
            --mm-font-family: 'IBM Plex Sans', -apple-system, sans-serif;
            --mm-font-size-root: 16px;
            --mm-font-size-branch: 13px;
            --mm-font-size-leaf: 12px;
            --mm-font-weight-root: 600;
            --mm-font-weight-branch: 500;
            --mm-font-weight-leaf: 400;
            --mm-line-height: 1.4;
            
            /* Colors - Dark Theme */
            --mm-bg: #0a0a0b;
            --mm-node-bg: #141416;
            --mm-node-border: #252529;
            --mm-node-border-hover: #3a3a40;
            --mm-text: #e8e8ec;
            --mm-text-muted: #a0a0a8;
            --mm-link-color: #2a2a30;
            --mm-circle-bg: #1e1e22;
            --mm-circle-border: #454550;
            
            /* Branch Colors (by depth) */
            --mm-branch-0: #3b82f6;  /* Blue */
            --mm-branch-1: #8b5cf6;  /* Purple */
            --mm-branch-2: #ec4899;  /* Pink */
            --mm-branch-3: #10b981;  /* Emerald */
            --mm-branch-4: #f59e0b;  /* Amber */
            --mm-branch-5: #ef4444;  /* Red */
            
            /* Animations */
            --mm-transition-fast: 150ms ease;
            --mm-transition-normal: 250ms ease;
            --mm-animation-duration: 400ms;  /* Expand/collapse animation duration */
        }

        /* ═══════════════════════════════════════════════════════════════
           BASE STYLES
           ═══════════════════════════════════════════════════════════════ */
        *, *::before, *::after { box-sizing: border-box; }
        
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: var(--mm-bg);
            font-family: var(--mm-font-family);
            color: var(--mm-text);
        }

        #mindmap {
            width: 100%;
            height: 100%;
            cursor: grab;
        }
        
        #mindmap:active { cursor: grabbing; }
        
        #mindmap svg {
            width: 100%;
            height: 100%;
        }

        /* ═══════════════════════════════════════════════════════════════
           NODE STYLES
           ═══════════════════════════════════════════════════════════════ */
        .mm-node { cursor: default; }
        
        .mm-node-card {
            fill: var(--mm-node-bg);
            stroke: var(--mm-node-border);
            stroke-width: 1px;
            rx: 6px;
            transition: stroke var(--mm-transition-fast);
        }
        
        .mm-node:hover .mm-node-card {
            stroke: var(--mm-node-border-hover);
        }
        
        .mm-node-text {
            fill: var(--mm-text);
            font-family: var(--mm-font-family);
            dominant-baseline: middle;
        }
        
        .mm-node-text.depth-0 {
            font-size: var(--mm-font-size-root);
            font-weight: var(--mm-font-weight-root);
        }
        
        .mm-node-text.depth-1,
        .mm-node-text.depth-2 {
            font-size: var(--mm-font-size-branch);
            font-weight: var(--mm-font-weight-branch);
        }
        
        .mm-node-text.depth-3,
        .mm-node-text.depth-leaf {
            font-size: var(--mm-font-size-leaf);
            font-weight: var(--mm-font-weight-leaf);
        }

        /* Branch accent lines */
        .mm-node-accent {
            stroke-width: 3px;
            stroke-linecap: round;
        }

        /* ═══════════════════════════════════════════════════════════════
           LINK STYLES
           ═══════════════════════════════════════════════════════════════ */
        .mm-link {
            fill: none;
            stroke: var(--mm-link-color);
            stroke-width: 1.5px;
        }

        /* ═══════════════════════════════════════════════════════════════
           EXPAND/COLLAPSE CIRCLE
           ═══════════════════════════════════════════════════════════════ */
        .mm-toggle {
            cursor: pointer;
        }
        
        .mm-toggle circle {
            fill: var(--mm-circle-bg);
            stroke: var(--mm-circle-border);
            stroke-width: 1.5px;
            transition: all var(--mm-transition-fast);
        }
        
        .mm-toggle:hover circle {
            stroke: var(--mm-text);
            fill: #252530;
        }
        
        .mm-toggle line {
            stroke: var(--mm-text-muted);
            stroke-width: 1.5px;
            stroke-linecap: round;
            transition: stroke var(--mm-transition-fast);
        }
        
        .mm-toggle:hover line {
            stroke: var(--mm-text);
        }

        /* ═══════════════════════════════════════════════════════════════
           CONTROLS OVERLAY
           ═══════════════════════════════════════════════════════════════ */
        .mm-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            z-index: 100;
        }
        
        .mm-btn {
            width: 36px;
            height: 36px;
            border: 1px solid var(--mm-node-border);
            background: var(--mm-node-bg);
            color: var(--mm-text-muted);
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all var(--mm-transition-fast);
        }
        
        .mm-btn:hover {
            border-color: var(--mm-node-border-hover);
            color: var(--mm-text);
        }
    </style>
</head>
<body>
    <div id="mindmap"></div>
    
    <div class="mm-controls">
        <button class="mm-btn" onclick="mindmap.zoomIn()" title="Zoom In">+</button>
        <button class="mm-btn" onclick="mindmap.zoomOut()" title="Zoom Out">−</button>
        <button class="mm-btn" onclick="mindmap.resetView()" title="Reset View">⌂</button>
    </div>

    <!-- Mindmap data as JSON -->
    <script type="application/json" id="mindmap-data">
${jsonData}
    </script>

    <!-- D3.js from CDN -->
    <script src="https://d3js.org/d3.v7.min.js"></script>

    <script>
    /* ═══════════════════════════════════════════════════════════════
       MINDMAP ENGINE
       ═══════════════════════════════════════════════════════════════ */
    
    class MindmapRenderer {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;
            
            // Get CSS variables for layout
            const style = getComputedStyle(document.documentElement);
            this.config = {
                levelGap: parseInt(style.getPropertyValue('--mm-level-gap')) || 200,
                nodeGap: parseInt(style.getPropertyValue('--mm-node-gap')) || 12,
                nodePaddingX: parseInt(style.getPropertyValue('--mm-node-padding-x')) || 16,
                nodePaddingY: parseInt(style.getPropertyValue('--mm-node-padding-y')) || 10,
                circleRadius: parseInt(style.getPropertyValue('--mm-circle-radius')) || 6,
                circleOffset: parseInt(style.getPropertyValue('--mm-circle-offset')) || 8,
                ...options
            };
            
            this.branchColors = [
                style.getPropertyValue('--mm-branch-0').trim() || '#3b82f6',
                style.getPropertyValue('--mm-branch-1').trim() || '#8b5cf6',
                style.getPropertyValue('--mm-branch-2').trim() || '#ec4899',
                style.getPropertyValue('--mm-branch-3').trim() || '#10b981',
                style.getPropertyValue('--mm-branch-4').trim() || '#f59e0b',
                style.getPropertyValue('--mm-branch-5').trim() || '#ef4444',
            ];
            
            this.svg = null;
            this.g = null;
            this.zoom = null;
            this.data = null;
            this.nodeId = 0;
        }

        /* ─────────────────────────────────────────────────────────────
           JSON PARSER
           ───────────────────────────────────────────────────────────── */
        parseJSON(json) {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            
            const addExpanded = (node, depth = 0) => {
                // Only expand root (depth 0), all branches start collapsed
                // Unless explicitly set in JSON
                if (node._expanded === undefined) {
                    node._expanded = depth === 0;
                }
                
                if (node.children) {
                    node.children.forEach(child => addExpanded(child, depth + 1));
                }
                return node;
            };
            
            return addExpanded(data);
        }

        /* ─────────────────────────────────────────────────────────────
           LAYOUT ENGINE
           ───────────────────────────────────────────────────────────── */
        measureText(text, depth) {
            // Create temporary text element to measure
            const fontSize = depth === 0 ? 16 : depth <= 2 ? 13 : 12;
            const fontWeight = depth === 0 ? 600 : depth <= 2 ? 500 : 400;
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = \`\${fontWeight} \${fontSize}px "IBM Plex Sans", sans-serif\`;
            
            return ctx.measureText(text).width;
        }

        calculateNodeSize(node, depth) {
            const textWidth = this.measureText(node.text, depth);
            const width = textWidth + this.config.nodePaddingX * 2;
            const height = (depth === 0 ? 20 : depth <= 2 ? 17 : 16) + this.config.nodePaddingY * 2;
            return { width, height };
        }

        layoutTree(root) {
            const { levelGap, nodeGap } = this.config;
            
            // Assign IDs and calculate sizes
            const assignIds = (node, depth = 0, branchIndex = 0) => {
                node._id = this.nodeId++;
                node._depth = depth;
                node._branchIndex = depth === 1 ? node._id : branchIndex;
                
                const size = this.calculateNodeSize(node, depth);
                node._width = size.width;
                node._height = size.height;
                
                if (node.children && node._expanded) {
                    node.children.forEach((child, i) => {
                        assignIds(child, depth + 1, depth === 0 ? i : branchIndex);
                    });
                }
            };
            
            // Calculate subtree heights
            const calculateHeight = (node) => {
                if (!node.children || !node._expanded || node.children.length === 0) {
                    node._subtreeHeight = node._height;
                    return node._subtreeHeight;
                }
                
                let totalHeight = 0;
                node.children.forEach((child, i) => {
                    totalHeight += calculateHeight(child);
                    if (i > 0) totalHeight += nodeGap;
                });
                
                node._subtreeHeight = Math.max(node._height, totalHeight);
                return node._subtreeHeight;
            };
            
            // Position nodes
            const positionNodes = (node, x = 0, yStart = 0) => {
                node._x = x;
                
                if (!node.children || !node._expanded || node.children.length === 0) {
                    node._y = yStart + node._subtreeHeight / 2;
                    return;
                }
                
                // Position children
                let currentY = yStart;
                node.children.forEach((child, i) => {
                    positionNodes(child, x + node._width + levelGap, currentY);
                    currentY += child._subtreeHeight + nodeGap;
                });
                
                // Center parent vertically among children
                const firstChild = node.children[0];
                const lastChild = node.children[node.children.length - 1];
                node._y = (firstChild._y + lastChild._y) / 2;
            };
            
            // Flatten tree for rendering
            const flatten = (node, nodes = [], links = []) => {
                nodes.push(node);
                
                if (node.children && node._expanded) {
                    node.children.forEach(child => {
                        links.push({ source: node, target: child });
                        flatten(child, nodes, links);
                    });
                }
                
                return { nodes, links };
            };
            
            this.nodeId = 0;
            assignIds(root);
            calculateHeight(root);
            positionNodes(root);
            
            return flatten(root);
        }

        /* ─────────────────────────────────────────────────────────────
           RENDERER
           ───────────────────────────────────────────────────────────── */
        render(data) {
            this.data = this.parseJSON(data);
            
            // Clear previous
            this.container.innerHTML = '';
            
            // Create SVG
            this.svg = d3.select(this.container)
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%');
            
            // Create zoom behavior
            this.zoom = d3.zoom()
                .scaleExtent([0.1, 3])
                .on('zoom', (event) => {
                    this.g.attr('transform', event.transform);
                });
            
            this.svg.call(this.zoom);
            
            // Create main group
            this.g = this.svg.append('g');
            
            // Create layers
            this.linksLayer = this.g.append('g').attr('class', 'mm-links');
            this.nodesLayer = this.g.append('g').attr('class', 'mm-nodes');
            
            this.update();
            this.resetView();
        }

        update() {
            const style = getComputedStyle(document.documentElement);
            const duration = parseInt(style.getPropertyValue('--mm-animation-duration')) || 400;
            const { nodes, links } = this.layoutTree(this.data);
            
            // ─── LINKS ───
            const linkSelection = this.linksLayer
                .selectAll('.mm-link')
                .data(links, d => \`\${d.source._id}-\${d.target._id}\`);
            
            // Exit
            linkSelection.exit()
                .transition()
                .duration(duration)
                .style('opacity', 0)
                .remove();
            
            // Enter
            const linkEnter = linkSelection.enter()
                .append('path')
                .attr('class', 'mm-link')
                .style('opacity', 0);
            
            // Update
            linkSelection.merge(linkEnter)
                .transition()
                .duration(duration)
                .style('opacity', 1)
                .attr('d', d => this.linkPath(d))
                .attr('stroke', d => this.getBranchColor(d.source._branchIndex));
            
            // ─── NODES ───
            const nodeSelection = this.nodesLayer
                .selectAll('.mm-node')
                .data(nodes, d => d._id);
            
            // Exit
            nodeSelection.exit()
                .transition()
                .duration(duration)
                .style('opacity', 0)
                .remove();
            
            // Enter
            const nodeEnter = nodeSelection.enter()
                .append('g')
                .attr('class', 'mm-node')
                .style('opacity', 0);
            
            // Card background
            nodeEnter.append('rect')
                .attr('class', 'mm-node-card');
            
            // Accent line (left border colored by branch)
            nodeEnter.append('line')
                .attr('class', 'mm-node-accent');
            
            // Text
            nodeEnter.append('text')
                .attr('class', 'mm-node-text');
            
            // Merge and update
            const nodeMerge = nodeSelection.merge(nodeEnter);
            
            nodeMerge
                .transition()
                .duration(duration)
                .style('opacity', 1)
                .attr('transform', d => \`translate(\${d._x}, \${d._y - d._height / 2})\`);
            
            nodeMerge.select('.mm-node-card')
                .transition()
                .duration(duration)
                .attr('width', d => d._width)
                .attr('height', d => d._height);
            
            nodeMerge.select('.mm-node-accent')
                .transition()
                .duration(duration)
                .attr('x1', 0)
                .attr('y1', 6)
                .attr('x2', 0)
                .attr('y2', d => d._height - 6)
                .attr('stroke', d => this.getBranchColor(d._branchIndex));
            
            nodeMerge.select('.mm-node-text')
                .attr('x', this.config.nodePaddingX)
                .attr('y', d => d._height / 2)
                .attr('class', d => \`mm-node-text depth-\${Math.min(d._depth, 3)}\`)
                .text(d => d.text);
            
            // ─── TOGGLE CIRCLES ───
            const hasChildren = nodes.filter(d => d.children && d.children.length > 0);
            
            const toggleSelection = this.nodesLayer
                .selectAll('.mm-toggle')
                .data(hasChildren, d => d._id);
            
            // Exit
            toggleSelection.exit()
                .transition()
                .duration(duration)
                .style('opacity', 0)
                .remove();
            
            // Enter
            const toggleEnter = toggleSelection.enter()
                .append('g')
                .attr('class', 'mm-toggle')
                .style('opacity', 0)
                .on('click', (event, d) => {
                    event.stopPropagation();
                    d._expanded = !d._expanded;
                    this.update();
                });
            
            toggleEnter.append('circle');
            toggleEnter.append('line').attr('class', 'mm-toggle-h');
            toggleEnter.append('line').attr('class', 'mm-toggle-v');
            
            const toggleMerge = toggleSelection.merge(toggleEnter);
            
            toggleMerge
                .transition()
                .duration(duration)
                .style('opacity', 1)
                .attr('transform', d => {
                    const x = d._x + d._width + this.config.circleOffset;
                    const y = d._y;
                    return \`translate(\${x}, \${y})\`;
                });
            
            toggleMerge.select('circle')
                .attr('r', this.config.circleRadius);
            
            // Horizontal line (always visible)
            toggleMerge.select('.mm-toggle-h')
                .attr('x1', -3)
                .attr('x2', 3)
                .attr('y1', 0)
                .attr('y2', 0);
            
            // Vertical line (only when collapsed) - with transition
            toggleMerge.select('.mm-toggle-v')
                .attr('x1', 0)
                .attr('x2', 0)
                .transition()
                .duration(200)
                .attr('y1', d => d._expanded ? 0 : -3)
                .attr('y2', d => d._expanded ? 0 : 3)
                .style('opacity', d => d._expanded ? 0 : 1);
        }

        linkPath(d) {
            const sourceX = d.source._x + d.source._width + this.config.circleOffset * 2 + this.config.circleRadius;
            const sourceY = d.source._y;
            const targetX = d.target._x;
            const targetY = d.target._y;
            
            const midX = (sourceX + targetX) / 2;
            
            return \`M \${sourceX} \${sourceY}
                    C \${midX} \${sourceY}, \${midX} \${targetY}, \${targetX} \${targetY}\`;
        }

        getBranchColor(branchIndex) {
            return this.branchColors[branchIndex % this.branchColors.length];
        }

        /* ─────────────────────────────────────────────────────────────
           VIEW CONTROLS
           ───────────────────────────────────────────────────────────── */
        resetView() {
            const bounds = this.g.node().getBBox();
            const containerRect = this.container.getBoundingClientRect();
            
            const scale = Math.min(
                0.9,
                (containerRect.width - 100) / bounds.width,
                (containerRect.height - 100) / bounds.height
            );
            
            const x = (containerRect.width - bounds.width * scale) / 2 - bounds.x * scale;
            const y = (containerRect.height - bounds.height * scale) / 2 - bounds.y * scale;
            
            this.svg.transition()
                .duration(500)
                .call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
        }

        zoomIn() {
            this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.3);
        }

        zoomOut() {
            this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.7);
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       INITIALIZATION
       ═══════════════════════════════════════════════════════════════ */
    let mindmap;
    
    document.addEventListener('DOMContentLoaded', () => {
        // Get content from JSON script tag
        const dataEl = document.getElementById('mindmap-data');
        const content = dataEl ? dataEl.textContent : '{}';
        
        // Initialize renderer
        mindmap = new MindmapRenderer('#mindmap');
        mindmap.render(JSON.parse(content));
        
        // Handle window resize
        window.addEventListener('resize', () => mindmap.resetView());
    });
    </script>
</body>
</html>`
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Generate HTML with node click events for David mode
 * Sends postMessage to parent when nodes are clicked
 */
export function generateMindmapHTMLWithNodeClick(data: MindmapNode, title: string): string {
  const jsonData = JSON.stringify(data, null, 2)

  // This is mostly the same as generateMindmapHTML but adds click event handling
  // and sends postMessage to parent window
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --mm-level-gap: 200px;
            --mm-node-gap: 12px;
            --mm-node-padding-x: 16px;
            --mm-node-padding-y: 10px;
            --mm-circle-radius: 6px;
            --mm-circle-offset: 8px;
            --mm-font-family: 'IBM Plex Sans', -apple-system, sans-serif;
            --mm-font-size-root: 16px;
            --mm-font-size-branch: 13px;
            --mm-font-size-leaf: 12px;
            --mm-font-weight-root: 600;
            --mm-font-weight-branch: 500;
            --mm-font-weight-leaf: 400;
            --mm-line-height: 1.4;
            --mm-bg: #0a0a0b;
            --mm-node-bg: #141416;
            --mm-node-border: #252529;
            --mm-node-border-hover: #3a3a40;
            --mm-text: #e8e8ec;
            --mm-text-muted: #a0a0a8;
            --mm-link-color: #2a2a30;
            --mm-circle-bg: #1e1e22;
            --mm-circle-border: #454550;
            --mm-branch-0: #3b82f6;
            --mm-branch-1: #8b5cf6;
            --mm-branch-2: #ec4899;
            --mm-branch-3: #10b981;
            --mm-branch-4: #f59e0b;
            --mm-branch-5: #ef4444;
            --mm-transition-fast: 150ms ease;
            --mm-transition-normal: 250ms ease;
            --mm-animation-duration: 400ms;
        }
        *, *::before, *::after { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: var(--mm-bg);
            font-family: var(--mm-font-family);
            color: var(--mm-text);
        }
        #mindmap {
            width: 100%;
            height: 100%;
            cursor: grab;
        }
        #mindmap:active { cursor: grabbing; }
        #mindmap svg { width: 100%; height: 100%; }
        .mm-node { cursor: pointer; }
        .mm-node-card {
            fill: var(--mm-node-bg);
            stroke: var(--mm-node-border);
            stroke-width: 1px;
            rx: 6px;
            transition: stroke var(--mm-transition-fast);
        }
        .mm-node:hover .mm-node-card { stroke: var(--mm-node-border-hover); }
        .mm-node-text {
            fill: var(--mm-text);
            font-family: var(--mm-font-family);
            dominant-baseline: middle;
            pointer-events: none;
        }
        .mm-node-text.depth-0 { font-size: var(--mm-font-size-root); font-weight: var(--mm-font-weight-root); }
        .mm-node-text.depth-1, .mm-node-text.depth-2 { font-size: var(--mm-font-size-branch); font-weight: var(--mm-font-weight-branch); }
        .mm-node-text.depth-3, .mm-node-text.depth-leaf { font-size: var(--mm-font-size-leaf); font-weight: var(--mm-font-weight-leaf); }
        .mm-node-accent { stroke-width: 3px; stroke-linecap: round; }
        .mm-link { fill: none; stroke: var(--mm-link-color); stroke-width: 1.5px; }
        .mm-toggle { cursor: pointer; }
        .mm-toggle circle { fill: var(--mm-circle-bg); stroke: var(--mm-circle-border); stroke-width: 1.5px; transition: all var(--mm-transition-fast); }
        .mm-toggle:hover circle { stroke: var(--mm-text); fill: #252530; }
        .mm-toggle line { stroke: var(--mm-text-muted); stroke-width: 1.5px; stroke-linecap: round; transition: stroke var(--mm-transition-fast); }
        .mm-toggle:hover line { stroke: var(--mm-text); }
        .mm-controls { position: fixed; bottom: 20px; right: 20px; display: flex; gap: 8px; z-index: 100; }
        .mm-btn { width: 36px; height: 36px; border: 1px solid var(--mm-node-border); background: var(--mm-node-bg); color: var(--mm-text-muted); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all var(--mm-transition-fast); }
        .mm-btn:hover { border-color: var(--mm-node-border-hover); color: var(--mm-text); }
    </style>
</head>
<body>
    <div id="mindmap"></div>
    <div class="mm-controls">
        <button class="mm-btn" onclick="mindmap.zoomIn()" title="Zoom In">+</button>
        <button class="mm-btn" onclick="mindmap.zoomOut()" title="Zoom Out">−</button>
        <button class="mm-btn" onclick="mindmap.resetView()" title="Reset View">⌂</button>
    </div>
    <script type="application/json" id="mindmap-data">
${jsonData}
    </script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script>
    class MindmapRenderer {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? document.querySelector(container) : container;
            const style = getComputedStyle(document.documentElement);
            this.config = {
                levelGap: parseInt(style.getPropertyValue('--mm-level-gap')) || 200,
                nodeGap: parseInt(style.getPropertyValue('--mm-node-gap')) || 12,
                nodePaddingX: parseInt(style.getPropertyValue('--mm-node-padding-x')) || 16,
                nodePaddingY: parseInt(style.getPropertyValue('--mm-node-padding-y')) || 10,
                circleRadius: parseInt(style.getPropertyValue('--mm-circle-radius')) || 6,
                circleOffset: parseInt(style.getPropertyValue('--mm-circle-offset')) || 8,
                ...options
            };
            this.branchColors = [
                style.getPropertyValue('--mm-branch-0').trim() || '#3b82f6',
                style.getPropertyValue('--mm-branch-1').trim() || '#8b5cf6',
                style.getPropertyValue('--mm-branch-2').trim() || '#ec4899',
                style.getPropertyValue('--mm-branch-3').trim() || '#10b981',
                style.getPropertyValue('--mm-branch-4').trim() || '#f59e0b',
                style.getPropertyValue('--mm-branch-5').trim() || '#ef4444',
            ];
            this.svg = null;
            this.g = null;
            this.zoom = null;
            this.data = null;
            this.nodeId = 0;
        }

        parseJSON(json) {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            const addExpanded = (node, depth = 0) => {
                if (node._expanded === undefined) { node._expanded = depth === 0; }
                if (node.children) { node.children.forEach(child => addExpanded(child, depth + 1)); }
                return node;
            };
            return addExpanded(data);
        }

        measureText(text, depth) {
            const fontSize = depth === 0 ? 16 : depth <= 2 ? 13 : 12;
            const fontWeight = depth === 0 ? 600 : depth <= 2 ? 500 : 400;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = \`\${fontWeight} \${fontSize}px "IBM Plex Sans", sans-serif\`;
            return ctx.measureText(text).width;
        }

        calculateNodeSize(node, depth) {
            const textWidth = this.measureText(node.text, depth);
            const width = textWidth + this.config.nodePaddingX * 2;
            const height = (depth === 0 ? 20 : depth <= 2 ? 17 : 16) + this.config.nodePaddingY * 2;
            return { width, height };
        }

        layoutTree(root) {
            const { levelGap, nodeGap } = this.config;
            const assignIds = (node, depth = 0, branchIndex = 0) => {
                node._id = this.nodeId++;
                node._depth = depth;
                node._branchIndex = depth === 1 ? node._id : branchIndex;
                const size = this.calculateNodeSize(node, depth);
                node._width = size.width;
                node._height = size.height;
                if (node.children && node._expanded) {
                    node.children.forEach((child, i) => { assignIds(child, depth + 1, depth === 0 ? i : branchIndex); });
                }
            };
            const calculateHeight = (node) => {
                if (!node.children || !node._expanded || node.children.length === 0) {
                    node._subtreeHeight = node._height;
                    return node._subtreeHeight;
                }
                let totalHeight = 0;
                node.children.forEach((child, i) => {
                    totalHeight += calculateHeight(child);
                    if (i > 0) totalHeight += nodeGap;
                });
                node._subtreeHeight = Math.max(node._height, totalHeight);
                return node._subtreeHeight;
            };
            const positionNodes = (node, x = 0, yStart = 0) => {
                node._x = x;
                if (!node.children || !node._expanded || node.children.length === 0) {
                    node._y = yStart + node._subtreeHeight / 2;
                    return;
                }
                let currentY = yStart;
                node.children.forEach((child, i) => {
                    positionNodes(child, x + node._width + levelGap, currentY);
                    currentY += child._subtreeHeight + nodeGap;
                });
                const firstChild = node.children[0];
                const lastChild = node.children[node.children.length - 1];
                node._y = (firstChild._y + lastChild._y) / 2;
            };
            const flatten = (node, nodes = [], links = []) => {
                nodes.push(node);
                if (node.children && node._expanded) {
                    node.children.forEach(child => {
                        links.push({ source: node, target: child });
                        flatten(child, nodes, links);
                    });
                }
                return { nodes, links };
            };
            this.nodeId = 0;
            assignIds(root);
            calculateHeight(root);
            positionNodes(root);
            return flatten(root);
        }

        render(data) {
            this.data = this.parseJSON(data);
            this.container.innerHTML = '';
            this.svg = d3.select(this.container).append('svg').attr('width', '100%').attr('height', '100%');
            this.zoom = d3.zoom().scaleExtent([0.1, 3]).on('zoom', (event) => { this.g.attr('transform', event.transform); });
            this.svg.call(this.zoom);
            this.g = this.svg.append('g');
            this.linksLayer = this.g.append('g').attr('class', 'mm-links');
            this.nodesLayer = this.g.append('g').attr('class', 'mm-nodes');
            this.update();
            this.resetView();
        }

        update() {
            const style = getComputedStyle(document.documentElement);
            const duration = parseInt(style.getPropertyValue('--mm-animation-duration')) || 400;
            const { nodes, links } = this.layoutTree(this.data);
            const self = this;

            // Links
            const linkSelection = this.linksLayer.selectAll('.mm-link').data(links, d => \`\${d.source._id}-\${d.target._id}\`);
            linkSelection.exit().transition().duration(duration).style('opacity', 0).remove();
            const linkEnter = linkSelection.enter().append('path').attr('class', 'mm-link').style('opacity', 0);
            linkSelection.merge(linkEnter).transition().duration(duration).style('opacity', 1).attr('d', d => this.linkPath(d)).attr('stroke', d => this.getBranchColor(d.source._branchIndex));

            // Nodes
            const nodeSelection = this.nodesLayer.selectAll('.mm-node').data(nodes, d => d._id);
            nodeSelection.exit().transition().duration(duration).style('opacity', 0).remove();
            const nodeEnter = nodeSelection.enter().append('g').attr('class', 'mm-node').style('opacity', 0);
            nodeEnter.append('rect').attr('class', 'mm-node-card');
            nodeEnter.append('line').attr('class', 'mm-node-accent');
            nodeEnter.append('text').attr('class', 'mm-node-text');

            // Add click handler to nodes for David mode
            nodeEnter.on('click', function(event, d) {
                event.stopPropagation();
                // Get screen position
                const rect = this.getBoundingClientRect();
                const screenX = rect.left + rect.width / 2;
                const screenY = rect.bottom;
                // Send message to parent
                window.parent.postMessage({
                    type: 'nodeClick',
                    nodeId: d._nodeId || d._id.toString(),
                    text: d.text,
                    screenX: screenX,
                    screenY: screenY
                }, '*');
            });

            const nodeMerge = nodeSelection.merge(nodeEnter);
            nodeMerge.transition().duration(duration).style('opacity', 1).attr('transform', d => \`translate(\${d._x}, \${d._y - d._height / 2})\`);
            nodeMerge.select('.mm-node-card').transition().duration(duration).attr('width', d => d._width).attr('height', d => d._height);
            nodeMerge.select('.mm-node-accent').transition().duration(duration).attr('x1', 0).attr('y1', 6).attr('x2', 0).attr('y2', d => d._height - 6).attr('stroke', d => this.getBranchColor(d._branchIndex));
            nodeMerge.select('.mm-node-text').attr('x', this.config.nodePaddingX).attr('y', d => d._height / 2).attr('class', d => \`mm-node-text depth-\${Math.min(d._depth, 3)}\`).text(d => d.text);

            // Toggle circles
            const hasChildren = nodes.filter(d => d.children && d.children.length > 0);
            const toggleSelection = this.nodesLayer.selectAll('.mm-toggle').data(hasChildren, d => d._id);
            toggleSelection.exit().transition().duration(duration).style('opacity', 0).remove();
            const toggleEnter = toggleSelection.enter().append('g').attr('class', 'mm-toggle').style('opacity', 0).on('click', (event, d) => {
                event.stopPropagation();
                d._expanded = !d._expanded;
                this.update();
            });
            toggleEnter.append('circle');
            toggleEnter.append('line').attr('class', 'mm-toggle-h');
            toggleEnter.append('line').attr('class', 'mm-toggle-v');
            const toggleMerge = toggleSelection.merge(toggleEnter);
            toggleMerge.transition().duration(duration).style('opacity', 1).attr('transform', d => { const x = d._x + d._width + this.config.circleOffset; const y = d._y; return \`translate(\${x}, \${y})\`; });
            toggleMerge.select('circle').attr('r', this.config.circleRadius);
            toggleMerge.select('.mm-toggle-h').attr('x1', -3).attr('x2', 3).attr('y1', 0).attr('y2', 0);
            toggleMerge.select('.mm-toggle-v').attr('x1', 0).attr('x2', 0).transition().duration(200).attr('y1', d => d._expanded ? 0 : -3).attr('y2', d => d._expanded ? 0 : 3).style('opacity', d => d._expanded ? 0 : 1);
        }

        linkPath(d) {
            const sourceX = d.source._x + d.source._width + this.config.circleOffset * 2 + this.config.circleRadius;
            const sourceY = d.source._y;
            const targetX = d.target._x;
            const targetY = d.target._y;
            const midX = (sourceX + targetX) / 2;
            return \`M \${sourceX} \${sourceY} C \${midX} \${sourceY}, \${midX} \${targetY}, \${targetX} \${targetY}\`;
        }

        getBranchColor(branchIndex) { return this.branchColors[branchIndex % this.branchColors.length]; }

        resetView() {
            const bounds = this.g.node().getBBox();
            const containerRect = this.container.getBoundingClientRect();
            const scale = Math.min(0.9, (containerRect.width - 100) / bounds.width, (containerRect.height - 100) / bounds.height);
            const x = (containerRect.width - bounds.width * scale) / 2 - bounds.x * scale;
            const y = (containerRect.height - bounds.height * scale) / 2 - bounds.y * scale;
            this.svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
        }

        zoomIn() { this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.3); }
        zoomOut() { this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.7); }
    }

    let mindmap;
    document.addEventListener('DOMContentLoaded', () => {
        const dataEl = document.getElementById('mindmap-data');
        const content = dataEl ? dataEl.textContent : '{}';
        mindmap = new MindmapRenderer('#mindmap');
        mindmap.render(JSON.parse(content));
        window.addEventListener('resize', () => mindmap.resetView());
    });
    </script>
</body>
</html>`
}

import type { BlockAttachment } from './types'

/**
 * Generate HTML with notes displayed as tooltips
 * For downloading mindmaps with text notes (no images)
 */
export function generateMindmapHTMLWithNotes(
  data: MindmapNode, 
  title: string,
  attachments: Record<string, BlockAttachment>
): string {
  // Create a map of nodeId -> notes for quick lookup
  const notesMap: Record<string, string[]> = {}
  Object.values(attachments).forEach(att => {
    if (att.notes && att.notes.length > 0) {
      notesMap[att.nodeId] = att.notes
    }
  })

  const jsonData = JSON.stringify({ ...data, _notesMap: notesMap }, null, 2)

  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --mm-level-gap: 200px;
            --mm-node-gap: 12px;
            --mm-node-padding-x: 16px;
            --mm-node-padding-y: 10px;
            --mm-circle-radius: 6px;
            --mm-circle-offset: 8px;
            --mm-font-family: 'IBM Plex Sans', -apple-system, sans-serif;
            --mm-font-size-root: 16px;
            --mm-font-size-branch: 13px;
            --mm-font-size-leaf: 12px;
            --mm-font-weight-root: 600;
            --mm-font-weight-branch: 500;
            --mm-font-weight-leaf: 400;
            --mm-line-height: 1.4;
            --mm-bg: #0a0a0b;
            --mm-node-bg: #141416;
            --mm-node-border: #252529;
            --mm-node-border-hover: #3a3a40;
            --mm-text: #e8e8ec;
            --mm-text-muted: #a0a0a8;
            --mm-link-color: #2a2a30;
            --mm-circle-bg: #1e1e22;
            --mm-circle-border: #454550;
            --mm-branch-0: #3b82f6;
            --mm-branch-1: #8b5cf6;
            --mm-branch-2: #ec4899;
            --mm-branch-3: #10b981;
            --mm-branch-4: #f59e0b;
            --mm-branch-5: #ef4444;
            --mm-transition-fast: 150ms ease;
            --mm-transition-normal: 250ms ease;
            --mm-animation-duration: 400ms;
        }
        *, *::before, *::after { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: var(--mm-bg);
            font-family: var(--mm-font-family);
            color: var(--mm-text);
        }
        #mindmap { width: 100%; height: 100%; cursor: grab; }
        #mindmap:active { cursor: grabbing; }
        #mindmap svg { width: 100%; height: 100%; }
        .mm-node { cursor: default; }
        .mm-node.has-notes { cursor: help; }
        .mm-node-card {
            fill: var(--mm-node-bg);
            stroke: var(--mm-node-border);
            stroke-width: 1px;
            rx: 6px;
            transition: stroke var(--mm-transition-fast);
        }
        .mm-node:hover .mm-node-card { stroke: var(--mm-node-border-hover); }
        .mm-node.has-notes .mm-node-card { stroke: var(--mm-branch-4); }
        .mm-node-text {
            fill: var(--mm-text);
            font-family: var(--mm-font-family);
            dominant-baseline: middle;
        }
        .mm-node-text.depth-0 { font-size: var(--mm-font-size-root); font-weight: var(--mm-font-weight-root); }
        .mm-node-text.depth-1, .mm-node-text.depth-2 { font-size: var(--mm-font-size-branch); font-weight: var(--mm-font-weight-branch); }
        .mm-node-text.depth-3, .mm-node-text.depth-leaf { font-size: var(--mm-font-size-leaf); font-weight: var(--mm-font-weight-leaf); }
        .mm-node-accent { stroke-width: 3px; stroke-linecap: round; }
        .mm-note-icon { fill: var(--mm-branch-4); }
        .mm-link { fill: none; stroke: var(--mm-link-color); stroke-width: 1.5px; }
        .mm-toggle { cursor: pointer; }
        .mm-toggle circle { fill: var(--mm-circle-bg); stroke: var(--mm-circle-border); stroke-width: 1.5px; transition: all var(--mm-transition-fast); }
        .mm-toggle:hover circle { stroke: var(--mm-text); fill: #252530; }
        .mm-toggle line { stroke: var(--mm-text-muted); stroke-width: 1.5px; stroke-linecap: round; transition: stroke var(--mm-transition-fast); }
        .mm-toggle:hover line { stroke: var(--mm-text); }
        .mm-controls { position: fixed; bottom: 20px; right: 20px; display: flex; gap: 8px; z-index: 100; }
        .mm-btn { width: 36px; height: 36px; border: 1px solid var(--mm-node-border); background: var(--mm-node-bg); color: var(--mm-text-muted); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all var(--mm-transition-fast); }
        .mm-btn:hover { border-color: var(--mm-node-border-hover); color: var(--mm-text); }
        
        /* Tooltip styles */
        .mm-tooltip {
            position: fixed;
            background: #1a1a1f;
            border: 1px solid #3a3a40;
            border-radius: 8px;
            padding: 12px 16px;
            max-width: 300px;
            z-index: 1000;
            pointer-events: none;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .mm-tooltip-title {
            font-size: 11px;
            font-weight: 600;
            color: #f59e0b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .mm-tooltip-note {
            font-size: 13px;
            color: #e8e8ec;
            line-height: 1.5;
            white-space: pre-wrap;
        }
        .mm-tooltip-note + .mm-tooltip-note {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #2a2a30;
        }
    </style>
</head>
<body>
    <div id="mindmap"></div>
    <div id="tooltip" class="mm-tooltip" style="display: none;"></div>
    <div class="mm-controls">
        <button class="mm-btn" onclick="mindmap.zoomIn()" title="Zoom In">+</button>
        <button class="mm-btn" onclick="mindmap.zoomOut()" title="Zoom Out">−</button>
        <button class="mm-btn" onclick="mindmap.resetView()" title="Reset View">⌂</button>
    </div>
    <script type="application/json" id="mindmap-data">
${jsonData}
    </script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script>
    let notesMap = {};
    
    class MindmapRenderer {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? document.querySelector(container) : container;
            const style = getComputedStyle(document.documentElement);
            this.config = {
                levelGap: parseInt(style.getPropertyValue('--mm-level-gap')) || 200,
                nodeGap: parseInt(style.getPropertyValue('--mm-node-gap')) || 12,
                nodePaddingX: parseInt(style.getPropertyValue('--mm-node-padding-x')) || 16,
                nodePaddingY: parseInt(style.getPropertyValue('--mm-node-padding-y')) || 10,
                circleRadius: parseInt(style.getPropertyValue('--mm-circle-radius')) || 6,
                circleOffset: parseInt(style.getPropertyValue('--mm-circle-offset')) || 8,
                ...options
            };
            this.branchColors = [
                style.getPropertyValue('--mm-branch-0').trim() || '#3b82f6',
                style.getPropertyValue('--mm-branch-1').trim() || '#8b5cf6',
                style.getPropertyValue('--mm-branch-2').trim() || '#ec4899',
                style.getPropertyValue('--mm-branch-3').trim() || '#10b981',
                style.getPropertyValue('--mm-branch-4').trim() || '#f59e0b',
                style.getPropertyValue('--mm-branch-5').trim() || '#ef4444',
            ];
            this.svg = null;
            this.g = null;
            this.zoom = null;
            this.data = null;
            this.nodeId = 0;
            this.tooltip = document.getElementById('tooltip');
        }

        parseJSON(json) {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            if (data._notesMap) {
                notesMap = data._notesMap;
                delete data._notesMap;
            }
            const addExpanded = (node, depth = 0) => {
                if (node._expanded === undefined) { node._expanded = depth === 0; }
                if (node.children) { node.children.forEach(child => addExpanded(child, depth + 1)); }
                return node;
            };
            return addExpanded(data);
        }

        measureText(text, depth) {
            const fontSize = depth === 0 ? 16 : depth <= 2 ? 13 : 12;
            const fontWeight = depth === 0 ? 600 : depth <= 2 ? 500 : 400;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = \`\${fontWeight} \${fontSize}px "IBM Plex Sans", sans-serif\`;
            return ctx.measureText(text).width;
        }

        calculateNodeSize(node, depth) {
            const textWidth = this.measureText(node.text, depth);
            const hasNotes = notesMap[node._nodeId] && notesMap[node._nodeId].length > 0;
            const iconWidth = hasNotes ? 20 : 0;
            const width = textWidth + this.config.nodePaddingX * 2 + iconWidth;
            const height = (depth === 0 ? 20 : depth <= 2 ? 17 : 16) + this.config.nodePaddingY * 2;
            return { width, height };
        }

        layoutTree(root) {
            const { levelGap, nodeGap } = this.config;
            const assignIds = (node, depth = 0, branchIndex = 0) => {
                node._id = this.nodeId++;
                node._depth = depth;
                node._branchIndex = depth === 1 ? node._id : branchIndex;
                const size = this.calculateNodeSize(node, depth);
                node._width = size.width;
                node._height = size.height;
                if (node.children && node._expanded) {
                    node.children.forEach((child, i) => { assignIds(child, depth + 1, depth === 0 ? i : branchIndex); });
                }
            };
            const calculateHeight = (node) => {
                if (!node.children || !node._expanded || node.children.length === 0) {
                    node._subtreeHeight = node._height;
                    return node._subtreeHeight;
                }
                let totalHeight = 0;
                node.children.forEach((child, i) => {
                    totalHeight += calculateHeight(child);
                    if (i > 0) totalHeight += nodeGap;
                });
                node._subtreeHeight = Math.max(node._height, totalHeight);
                return node._subtreeHeight;
            };
            const positionNodes = (node, x = 0, yStart = 0) => {
                node._x = x;
                if (!node.children || !node._expanded || node.children.length === 0) {
                    node._y = yStart + node._subtreeHeight / 2;
                    return;
                }
                let currentY = yStart;
                node.children.forEach((child, i) => {
                    positionNodes(child, x + node._width + levelGap, currentY);
                    currentY += child._subtreeHeight + nodeGap;
                });
                const firstChild = node.children[0];
                const lastChild = node.children[node.children.length - 1];
                node._y = (firstChild._y + lastChild._y) / 2;
            };
            const flatten = (node, nodes = [], links = []) => {
                nodes.push(node);
                if (node.children && node._expanded) {
                    node.children.forEach(child => {
                        links.push({ source: node, target: child });
                        flatten(child, nodes, links);
                    });
                }
                return { nodes, links };
            };
            this.nodeId = 0;
            assignIds(root);
            calculateHeight(root);
            positionNodes(root);
            return flatten(root);
        }

        render(data) {
            this.data = this.parseJSON(data);
            this.container.innerHTML = '';
            this.svg = d3.select(this.container).append('svg').attr('width', '100%').attr('height', '100%');
            this.zoom = d3.zoom().scaleExtent([0.1, 3]).on('zoom', (event) => { this.g.attr('transform', event.transform); });
            this.svg.call(this.zoom);
            this.g = this.svg.append('g');
            this.linksLayer = this.g.append('g').attr('class', 'mm-links');
            this.nodesLayer = this.g.append('g').attr('class', 'mm-nodes');
            this.update();
            this.resetView();
        }

        showTooltip(d, element) {
            const notes = notesMap[d._nodeId];
            if (!notes || notes.length === 0) return;
            
            const rect = element.getBoundingClientRect();
            let html = '<div class="mm-tooltip-title">Notes</div>';
            notes.forEach(note => {
                html += '<div class="mm-tooltip-note">' + note.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
            });
            this.tooltip.innerHTML = html;
            this.tooltip.style.display = 'block';
            
            // Position tooltip
            const tooltipRect = this.tooltip.getBoundingClientRect();
            let x = rect.left + rect.width / 2 - tooltipRect.width / 2;
            let y = rect.bottom + 10;
            
            // Keep within viewport
            if (x < 10) x = 10;
            if (x + tooltipRect.width > window.innerWidth - 10) x = window.innerWidth - tooltipRect.width - 10;
            if (y + tooltipRect.height > window.innerHeight - 10) y = rect.top - tooltipRect.height - 10;
            
            this.tooltip.style.left = x + 'px';
            this.tooltip.style.top = y + 'px';
        }

        hideTooltip() {
            this.tooltip.style.display = 'none';
        }

        update() {
            const style = getComputedStyle(document.documentElement);
            const duration = parseInt(style.getPropertyValue('--mm-animation-duration')) || 400;
            const { nodes, links } = this.layoutTree(this.data);
            const self = this;

            // Links
            const linkSelection = this.linksLayer.selectAll('.mm-link').data(links, d => \`\${d.source._id}-\${d.target._id}\`);
            linkSelection.exit().transition().duration(duration).style('opacity', 0).remove();
            const linkEnter = linkSelection.enter().append('path').attr('class', 'mm-link').style('opacity', 0);
            linkSelection.merge(linkEnter).transition().duration(duration).style('opacity', 1).attr('d', d => this.linkPath(d)).attr('stroke', d => this.getBranchColor(d.source._branchIndex));

            // Nodes
            const nodeSelection = this.nodesLayer.selectAll('.mm-node').data(nodes, d => d._id);
            nodeSelection.exit().transition().duration(duration).style('opacity', 0).remove();
            const nodeEnter = nodeSelection.enter().append('g').attr('class', d => {
                const hasNotes = notesMap[d._nodeId] && notesMap[d._nodeId].length > 0;
                return 'mm-node' + (hasNotes ? ' has-notes' : '');
            }).style('opacity', 0);
            nodeEnter.append('rect').attr('class', 'mm-node-card');
            nodeEnter.append('line').attr('class', 'mm-node-accent');
            nodeEnter.append('text').attr('class', 'mm-node-text');
            
            // Add note icon for nodes with notes
            nodeEnter.each(function(d) {
                const hasNotes = notesMap[d._nodeId] && notesMap[d._nodeId].length > 0;
                if (hasNotes) {
                    d3.select(this).append('text')
                        .attr('class', 'mm-note-icon')
                        .attr('font-size', '12px')
                        .text('📝');
                }
            });

            // Tooltip events
            nodeEnter.on('mouseenter', function(event, d) {
                self.showTooltip(d, this);
            }).on('mouseleave', function() {
                self.hideTooltip();
            });

            const nodeMerge = nodeSelection.merge(nodeEnter);
            nodeMerge.transition().duration(duration).style('opacity', 1).attr('transform', d => \`translate(\${d._x}, \${d._y - d._height / 2})\`);
            nodeMerge.select('.mm-node-card').transition().duration(duration).attr('width', d => d._width).attr('height', d => d._height);
            nodeMerge.select('.mm-node-accent').transition().duration(duration).attr('x1', 0).attr('y1', 6).attr('x2', 0).attr('y2', d => d._height - 6).attr('stroke', d => this.getBranchColor(d._branchIndex));
            nodeMerge.select('.mm-node-text').attr('x', this.config.nodePaddingX).attr('y', d => d._height / 2).attr('class', d => \`mm-node-text depth-\${Math.min(d._depth, 3)}\`).text(d => d.text);
            nodeMerge.select('.mm-note-icon').attr('x', d => d._width - 24).attr('y', d => d._height / 2 + 4);

            // Toggle circles
            const hasChildren = nodes.filter(d => d.children && d.children.length > 0);
            const toggleSelection = this.nodesLayer.selectAll('.mm-toggle').data(hasChildren, d => d._id);
            toggleSelection.exit().transition().duration(duration).style('opacity', 0).remove();
            const toggleEnter = toggleSelection.enter().append('g').attr('class', 'mm-toggle').style('opacity', 0).on('click', (event, d) => {
                event.stopPropagation();
                d._expanded = !d._expanded;
                this.update();
            });
            toggleEnter.append('circle');
            toggleEnter.append('line').attr('class', 'mm-toggle-h');
            toggleEnter.append('line').attr('class', 'mm-toggle-v');
            const toggleMerge = toggleSelection.merge(toggleEnter);
            toggleMerge.transition().duration(duration).style('opacity', 1).attr('transform', d => { const x = d._x + d._width + this.config.circleOffset; const y = d._y; return \`translate(\${x}, \${y})\`; });
            toggleMerge.select('circle').attr('r', this.config.circleRadius);
            toggleMerge.select('.mm-toggle-h').attr('x1', -3).attr('x2', 3).attr('y1', 0).attr('y2', 0);
            toggleMerge.select('.mm-toggle-v').attr('x1', 0).attr('x2', 0).transition().duration(200).attr('y1', d => d._expanded ? 0 : -3).attr('y2', d => d._expanded ? 0 : 3).style('opacity', d => d._expanded ? 0 : 1);
        }

        linkPath(d) {
            const sourceX = d.source._x + d.source._width + this.config.circleOffset * 2 + this.config.circleRadius;
            const sourceY = d.source._y;
            const targetX = d.target._x;
            const targetY = d.target._y;
            const midX = (sourceX + targetX) / 2;
            return \`M \${sourceX} \${sourceY} C \${midX} \${sourceY}, \${midX} \${targetY}, \${targetX} \${targetY}\`;
        }

        getBranchColor(branchIndex) { return this.branchColors[branchIndex % this.branchColors.length]; }

        resetView() {
            const bounds = this.g.node().getBBox();
            const containerRect = this.container.getBoundingClientRect();
            const scale = Math.min(0.9, (containerRect.width - 100) / bounds.width, (containerRect.height - 100) / bounds.height);
            const x = (containerRect.width - bounds.width * scale) / 2 - bounds.x * scale;
            const y = (containerRect.height - bounds.height * scale) / 2 - bounds.y * scale;
            this.svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
        }

        zoomIn() { this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.3); }
        zoomOut() { this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.7); }
    }

    let mindmap;
    document.addEventListener('DOMContentLoaded', () => {
        const dataEl = document.getElementById('mindmap-data');
        const content = dataEl ? dataEl.textContent : '{}';
        mindmap = new MindmapRenderer('#mindmap');
        mindmap.render(JSON.parse(content));
        window.addEventListener('resize', () => mindmap.resetView());
    });
    </script>
</body>
</html>`
}

/**
 * Trigger a file download in the browser
 * @param content - The file content as a string
 * @param filename - The name of the file to download
 */
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
