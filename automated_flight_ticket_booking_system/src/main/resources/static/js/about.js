document.addEventListener('DOMContentLoaded', function() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const contentLinks = document.querySelectorAll('.content-link');
    let lastOpenedSection = null;
    let lastOpenedViaLink = null;

    // Function to check if a section is a subsection
    function isSubsection(header) {
        return header.closest('.nested-accordion') !== null || 
               header.closest('.deeply-nested-accordion') !== null;
    }

    // Function to get all parent sections
    function getAllParentSections(header) {
        const parents = [];
        let current = header;
        
        // Find all parent sections
        while (current) {
            // First try to find a deeply nested accordion
            let parentAccordion = current.closest('.deeply-nested-accordion');
            if (parentAccordion) {
                // Find the parent section that contains this deeply nested accordion
                let parentSection = parentAccordion.closest('.nested-accordion');
                if (parentSection) {
                    const parentHeader = parentSection.querySelector('.accordion-header');
                    if (parentHeader && parentHeader !== current) {
                        parents.unshift(parentHeader);
                        current = parentHeader;
                        continue;
                    }
                }
            }
            
            // Then try to find a regular nested accordion
            parentAccordion = current.closest('.nested-accordion');
            if (parentAccordion) {
                // Find the parent section that contains this nested accordion
                let parentSection = parentAccordion.closest('.accordion');
                if (parentSection) {
                    const parentHeader = parentSection.querySelector('.accordion-header');
                    if (parentHeader && parentHeader !== current) {
                        parents.unshift(parentHeader);
                        current = parentHeader;
                        continue;
                    }
                }
            }
            
            break;
        }
        
        return parents;
    }

    // Function to open a section
    function openSection(header, content) {
        console.log('Opening section:', header.id);
        header.classList.add('active');
        content.classList.add('show');
    }

    // Function to close a section
    function closeSection(header, content) {
        console.log('Closing section:', header.id);
        header.classList.remove('active');
        content.classList.remove('show');
    }

    // Function to close all sections
    function closeAllSections() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            const content = header.nextElementSibling;
            closeSection(header, content);
        });
    }

    // Handle accordion header clicks
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isSub = isSubsection(this);

            // If clicking a subsection, only toggle that section
            if (isSub) {
                this.classList.toggle('active');
                content.classList.toggle('show');
                return;
            }

            // If clicking a main section
            if (this.classList.contains('active')) {
                // If it's already open, just close it
                closeSection(this, content);
                lastOpenedSection = null;
                lastOpenedViaLink = null;
            } else {
                // Close all sections first
                closeAllSections();
                // Open the clicked section
                openSection(this, content);
                lastOpenedSection = this;
                lastOpenedViaLink = null;
            }
        });
    });

    // Handle hyperlink clicks
    contentLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            console.log('Link clicked, target:', targetId);
            
            const targetHeader = document.getElementById(targetId);
            if (!targetHeader) {
                console.error('Target header not found:', targetId);
                return;
            }
            
            const targetContent = targetHeader.nextElementSibling;
            if (!targetContent) {
                console.error('Target content not found for:', targetId);
                return;
            }

            console.log('Found target header:', targetHeader.id);
            console.log('Found target content:', targetContent.id);

            // Get all parent sections
            const parentSections = getAllParentSections(targetHeader);
            console.log('Parent sections:', parentSections.map(h => h.id));
            
            // Open all parent sections first
            parentSections.forEach(header => {
                const content = header.nextElementSibling;
                openSection(header, content);
            });

            // Open the target section
            openSection(targetHeader, targetContent);

            // Update last opened section
            lastOpenedSection = parentSections[0] || targetHeader;
            lastOpenedViaLink = targetHeader;

            // Scroll to the target section with a small delay to ensure sections are opened
            setTimeout(() => {
                console.log('Scrolling to:', targetHeader.id);
                targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    });
}); 