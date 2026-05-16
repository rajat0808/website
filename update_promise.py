import re
import glob
import os

html_file = r'd:\New folder (3)\emporio\events.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# The untracked images
new_images = [
    'assets/DSCF5041.JPG',
    'assets/DSCF5097.JPG',
    'assets/DSCF5118.JPG',
    'assets/DSCF5120.JPG',
    'assets/DSCF5190.JPG',
    'assets/DSCF5277.JPG',
    'assets/DSCF5285.JPG',
    'assets/DSCF5296.JPG',
    'assets/DSCF5307.JPG',
    'assets/DSCF5342.JPG',
    'assets/DSCF5382.JPG',
    'assets/DSCF5389.JPG',
    'assets/DSCF5390.JPG',
    'assets/DSCF5396.JPG',
    'assets/DSCF5635.JPG'
]

# Generate HTML for new images
new_figures = []
for idx, img in enumerate(new_images):
    # first one is eager, others lazy (if they are at the top)
    # wait, the first of the gallery is eager, but if I add 15, the first should be eager and the rest lazy.
    # Actually, just make them all lazy since they might not be the absolute first thing on the page, except the first one.
    loading = "eager" if idx == 0 else "lazy"
    fetchpriority = "high" if idx == 0 else "low"
    fig = f"""                  <figure class="event-collage__item">
                    <img
                      src="{img}"
                      alt="THE PROMISE Launch photo"
                      loading="{loading}"
                      fetchpriority="{fetchpriority}"
                      decoding="async"
                    />
                  </figure>"""
    new_figures.append(fig)

new_figures_html = "\n".join(new_figures)

# Find "THE PROMISE" gallery
# It's bounded by <div class="event-collage" data-gallery-title="THE PROMISE - Launch of Luxury Bridal Space"... >
# and the next </div></div></article>
promise_start = content.find('data-gallery-title="THE PROMISE - Launch of Luxury Bridal Space"')
gallery_div_end = content.find('>', promise_start) + 1

# Find the first figure in this gallery
first_figure_start = content.find('<figure', gallery_div_end)
first_figure_end = content.find('</figure>', first_figure_start) + len('</figure>')

first_figure_html = content[first_figure_start:first_figure_end]

# It should be DSCF5038.JPG
if 'DSCF5038.JPG' in first_figure_html:
    # Change first_figure_html to be lazy
    first_figure_html = first_figure_html.replace('loading="eager"', 'loading="lazy"').replace('fetchpriority="high"', 'fetchpriority="low"')
    
    # Extract the rest of the gallery until the closing </div> of event-collage
    # Let's use regex to find the closing tag of this event-collage div.
    # A simple way is to find the next </div>\n              </div>\n            </article>
    end_of_gallery = content.find('</div>\n              </div>\n            </article>', first_figure_end)
    
    # We remove the first figure from the start, insert the new figures, and append the first figure to the end
    rest_of_gallery = content[first_figure_end:end_of_gallery]
    
    # Put it all together
    new_gallery_content = "\n" + new_figures_html + rest_of_gallery + "\n" + first_figure_html + "\n                "
    
    new_content = content[:first_figure_start] + new_gallery_content + content[end_of_gallery:]
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    print("First figure is not DSCF5038.JPG, it is:", first_figure_html)

