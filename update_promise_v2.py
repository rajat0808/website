import os

files = [
    r'd:\New folder (3)\emporio\events.html',
    r'd:\New folder (3)\emporio\dist\events.html'
]

new_img = 'assets/DSCF5307.JPG'

for html_file in files:
    if not os.path.exists(html_file):
        print(f"Skipping {html_file}, not found.")
        continue
        
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find "THE PROMISE" gallery
    promise_title = 'data-gallery-title="THE PROMISE - Launch of Luxury Bridal Space"'
    promise_start = content.find(promise_title)
    if promise_start == -1:
        print(f"Could not find title in {html_file}")
        continue
        
    gallery_div_end = content.find('>', promise_start) + 1

    # Find the first figure in this gallery
    first_figure_start = content.find('<figure', gallery_div_end)
    first_figure_end = content.find('</figure>', first_figure_start) + len('</figure>')

    first_figure_html = content[first_figure_start:first_figure_end]

    # Verify it's DSCF5038.JPG (or at least extract it to move it)
    # Ensure it's lazy now if it's moving to the end
    moved_figure = first_figure_html.replace('loading="eager"', 'loading="lazy"').replace('fetchpriority="high"', 'fetchpriority="low"')

    # New figure for the top
    new_figure = f"""                  <figure class="event-collage__item">
                    <img
                      src="{new_img}"
                      alt="THE PROMISE Launch photo"
                      loading="eager"
                      fetchpriority="high"
                      decoding="async"
                    />
                  </figure>"""

    # Find the end of the gallery div
    # The gallery ends at the next </div>\n              </div>\n            </article>
    # or just look for the end of the current collage div.
    # Actually, let's find the </div> that closes the event-collage
    # Since we know the structure, we can look for the next article start or section end.
    # Looking for the next article start:
    next_article = content.find('<article', first_figure_end)
    # The </div> closing the collage is just before that.
    # Structure: </div>\n              </div>\n            </article>
    end_of_gallery = content.rfind('</div>', promise_start, next_article if next_article != -1 else len(content))
    # Wait, the structure is:
    # <div class="event-collage" ...>
    #   <figure>...</figure>
    #   ...
    # </div>
    # So we find the closing </div> of the collage.
    
    # Let's just find the last </figure> in this section.
    last_figure_end = content.rfind('</figure>', promise_start, next_article if next_article != -1 else len(content)) + len('</figure>')
    
    # We remove the first figure, insert new_figure at the start, and moved_figure after the last figure.
    # Root part
    gallery_header = content[gallery_div_end:first_figure_start]
    gallery_middle = content[first_figure_end:last_figure_end]
    gallery_footer = content[last_figure_end:]
    
    # New gallery content
    new_gallery = gallery_header + "\n" + new_figure + gallery_middle + "\n" + moved_figure + gallery_footer
    
    new_content = content[:gallery_div_end] + new_gallery
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {html_file}")

print("Done")
